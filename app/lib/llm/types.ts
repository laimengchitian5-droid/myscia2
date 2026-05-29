import type {
  LLMCompletionInput,
  LLMCompletionOutput,
  LLMProvider,
  LLMProviderConfig,
} from "@/app/types";

// すべてのLLMプロバイダーが実装すべきインタフェース
export interface ILLMProvider {
  readonly providerName: LLMProvider;
  readonly config: LLMProviderConfig;
  complete(input: LLMCompletionInput): Promise<LLMCompletionOutput>;
}

export type { LLMCompletionInput, LLMCompletionOutput, LLMProvider, LLMProviderConfig };
