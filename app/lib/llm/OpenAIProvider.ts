// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  OpenAI プロバイダー (将来拡張用スタブ)
//  npm install openai 後にコメントアウトを外して使用
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import type { ILLMProvider, LLMCompletionInput, LLMCompletionOutput, LLMProviderConfig } from "./types";
import type { LLMJsonResponse } from "@/app/types";

export class OpenAIProvider implements ILLMProvider {
  readonly providerName = "openai" as const;
  readonly config: LLMProviderConfig;

  constructor(overrideConfig?: Partial<LLMProviderConfig>) {
    this.config = {
      apiKey: overrideConfig?.apiKey ?? process.env.OPENAI_API_KEY ?? "",
      model: overrideConfig?.model ?? "gpt-4o-mini",
      maxTokens: overrideConfig?.maxTokens ?? 1500,
      temperature: overrideConfig?.temperature ?? 0.4,
    };
  }

  async complete(_input: LLMCompletionInput): Promise<LLMCompletionOutput> {
    // TODO: npm install openai してから実装
    // import OpenAI from "openai";
    // const client = new OpenAI({ apiKey: this.config.apiKey });
    // ...
    throw new Error("OpenAIProvider: not yet implemented. Install `openai` package.");
  }
}

// 型エクスポート（他ファイルで使いやすいように）
export type { ILLMProvider, LLMCompletionInput, LLMCompletionOutput, LLMProviderConfig, LLMJsonResponse };
