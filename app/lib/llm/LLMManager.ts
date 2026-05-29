// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  LLMManager — ファクトリーパターン + プロキシ構造
//  新プロバイダーを追加する際は providers マップに登録するだけ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import type { LLMProvider, LLMProviderConfig } from "@/app/types";
import type { ILLMProvider, LLMCompletionInput, LLMCompletionOutput } from "./types";
import { GroqProvider } from "./GroqProvider";
import { OpenAIProvider } from "./OpenAIProvider";

type ProviderConstructor = new (config?: Partial<LLMProviderConfig>) => ILLMProvider;

// プロバイダーレジストリ（プラグイン感覚で追加可能）
const PROVIDER_REGISTRY: Record<LLMProvider, ProviderConstructor> = {
  groq: GroqProvider,
  openai: OpenAIProvider,
  // 将来追加: anthropic: AnthropicProvider,
  // 将来追加: gemini: GeminiProvider,
  anthropic: OpenAIProvider, // 暫定スタブ
  gemini: OpenAIProvider,    // 暫定スタブ
};

export class LLMManager {
  private provider: ILLMProvider;

  constructor(
    providerName: LLMProvider = "groq",
    overrideConfig?: Partial<LLMProviderConfig>
  ) {
    const Constructor = PROVIDER_REGISTRY[providerName];
    if (!Constructor) {
      throw new Error(`LLMManager: Unknown provider "${providerName}"`);
    }
    this.provider = new Constructor(overrideConfig);
  }

  get activeProvider(): LLMProvider {
    return this.provider.providerName;
  }

  get activeModel(): string {
    return this.provider.config.model;
  }

  async complete(input: LLMCompletionInput): Promise<LLMCompletionOutput> {
    return this.provider.complete(input);
  }

  // プロバイダー切り替え（ランタイム対応）
  switchProvider(providerName: LLMProvider, overrideConfig?: Partial<LLMProviderConfig>): void {
    const Constructor = PROVIDER_REGISTRY[providerName];
    if (!Constructor) throw new Error(`LLMManager: Unknown provider "${providerName}"`);
    this.provider = new Constructor(overrideConfig);
  }
}
