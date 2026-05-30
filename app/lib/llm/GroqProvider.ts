import Groq from "groq-sdk";
import type { ILLMProvider, LLMCompletionInput, LLMCompletionOutput, LLMProviderConfig } from "./types";
import type { LLMJsonResponse } from "@/app/types";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  【絶対条件1】二段構えのAPIキー読み込み
//  ローカル変数が実キーなら最優先、未設定なら環境変数にフォールバック
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const LOCAL_API_KEY_PLACEHOLDER = "gsk_"; // 実キーをここに直接書く場合はこの変数を書き換える
const LOCAL_API_KEY = LOCAL_API_KEY_PLACEHOLDER.length > 10 ? LOCAL_API_KEY_PLACEHOLDER : "";

export function resolveGroqApiKey(): string {
  if (LOCAL_API_KEY && LOCAL_API_KEY.length > 10) return LOCAL_API_KEY;
  return process.env.GROQ_API_KEY ?? "";
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  LLMが返した生テキストから純粋なJSONオブジェクトを抽出する
//  コードフェンス(```json)、前後の説明文、BOMなどを除去する
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function extractJson(raw: string): string {
  // BOMと前後の空白を除去
  let text = raw.replace(/^\uFEFF/, "").trim();

  // ```json ... ``` または ``` ... ``` を除去
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // { から始まる最初のJSONオブジェクトブロックを抽出
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }

  return text;
}

export class GroqProvider implements ILLMProvider {
  readonly providerName = "groq" as const;
  readonly config: LLMProviderConfig;
  private client: Groq;

  constructor(overrideConfig?: Partial<LLMProviderConfig>) {
    const apiKey = resolveGroqApiKey();
    this.config = {
      apiKey,
      model: overrideConfig?.model ?? "llama-3.3-70b-versatile",
      maxTokens: overrideConfig?.maxTokens ?? 2000,
      temperature: overrideConfig?.temperature ?? 0.3,
    };
    this.client = new Groq({ apiKey: this.config.apiKey });
  }

  async complete(input: LLMCompletionInput): Promise<LLMCompletionOutput> {
    const startTime = Date.now();

    // ── 429 レートリミット時に1回自動リトライ ──────────────
    const callApi = () => this.client.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: "system", content: input.systemPrompt },
        { role: "user",   content: input.userMessage  },
      ],
      max_tokens:      this.config.maxTokens,
      temperature:     this.config.temperature,
      response_format: { type: "json_object" },
    });

    let completion: Awaited<ReturnType<typeof callApi>>;
    try {
      completion = await callApi();
    } catch (firstErr: unknown) {
      const is429 =
        firstErr instanceof Error &&
        (firstErr.message.includes("429") ||
          firstErr.message.toLowerCase().includes("rate_limit") ||
          firstErr.message.toLowerCase().includes("rate limit"));

      if (is429) {
        // 3秒待ってから1回リトライ
        await new Promise((r) => setTimeout(r, 3000));
        completion = await callApi();
      } else {
        throw firstErr;
      }
    }

    const rawText = completion.choices[0]?.message?.content ?? "{}";
    const latencyMs = Date.now() - startTime;

    // コードフェンスや余分なテキストを除去してから JSON.parse
    const cleanedText = extractJson(rawText);

    let parsed: LLMJsonResponse;
    try {
      parsed = JSON.parse(cleanedText) as LLMJsonResponse;
    } catch {
      throw new Error(
        `Groq JSON parse failed.\nRaw (first 300 chars): ${rawText.slice(0, 300)}\nCleaned: ${cleanedText.slice(0, 300)}`
      );
    }

    return { rawText, parsed, model: this.config.model, latencyMs };
  }
}
