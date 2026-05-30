// ============================================================
//  SciaSource — 全共通型定義
// ============================================================

export type UserType =
  // 学生層
  | "中学生"
  | "高校生"
  | "大学生"
  | "大学院生"
  // 社会人層
  | "大卒社会人"
  | "大学院卒社会人"
  | "シニア社会人";

export type AgeGroup =
  | "指定なし"
  | "15〜19歳"
  | "20〜24歳"
  | "25〜29歳"
  | "30〜34歳"
  | "35〜39歳"
  | "40〜44歳"
  | "45〜49歳"
  | "50代"
  | "60代以上";

export type LLMProvider = "groq" | "openai" | "anthropic" | "gemini";

export type ResearchDepth = "standard" | "deep";
export type Plan = "personal" | "enterprise" | "researcher";

export type Lang = "ja" | "en" | "zh" | "ko";

// ---------- リクエスト ----------
export interface PredictRequest {
  question: string;
  userType: UserType;
  ageGroup?: AgeGroup;
  showSources: boolean;
  showChart: boolean;
  provider?: LLMProvider;
  lang?: Lang;
  researchDepth?: ResearchDepth;
  plan?: Plan;
}

// ---------- ソース ----------
export interface SourceItem {
  title: string;
  url: string;
}

// ---------- チャートデータ ----------
export interface ChartDataPoint {
  name: string;
  value: number;
}

// ---------- ティア表 ----------
export type Tier = "S" | "A" | "B" | "C";

export interface TierItem {
  tier: Tier;
  action: string;   // 左側: 具体的なアクション名
  insight: string;  // 右側: プラスαの専門知識・科学的解説
}

// ---------- LLMが返すJSONの型（内部） ----------
export interface LLMJsonResponse {
  success: boolean;
  field: string;
  method: string;
  metrics: string;
  explanation: string;
  detailedExplanation: string;
  practicalPlans: TierItem[];  // 日常・今夜から実践できる具体案（ティア付き）
  academicPlans: TierItem[];   // 学術・研究・ビジネス調査の手順（ティア付き）
  sources: SourceItem[];
  chartData: ChartDataPoint[];
}

// ---------- APIルートのレスポンス ----------
export interface PredictResponse extends LLMJsonResponse {
  provider: LLMProvider;
  model: string;
  latencyMs: number;
  isFallback?: boolean;
  errorMessage?: string;
  fromCache?: boolean; // LocalStorage キャッシュヒット時に true
}

// ---------- LLMプロバイダー共通インタフェース ----------
export interface LLMProviderConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface LLMCompletionInput {
  systemPrompt: string;
  userMessage: string;
}

export interface LLMCompletionOutput {
  rawText: string;
  parsed: LLMJsonResponse;
  model: string;
  latencyMs: number;
}
