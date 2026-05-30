// ============================================================
//  scia-nexus® — 全共通型定義
// ============================================================

export type UserType =
  | "中学生" | "高校生" | "大学生" | "大学院生"
  | "大卒社会人" | "大学院卒社会人" | "シニア社会人";

export type AgeGroup =
  | "指定なし"
  | "15〜19歳" | "20〜24歳" | "25〜29歳" | "30〜34歳" | "35〜39歳"
  | "40〜44歳" | "45〜49歳" | "50代" | "60代以上";

export type LLMProvider = "groq" | "openai" | "anthropic" | "gemini";
export type ResearchDepth = "standard" | "deep";
export type Plan = "personal" | "enterprise" | "researcher";
export type Lang = "ja" | "en" | "zh" | "ko";

// ──── リクエスト ────────────────────────────────────────────
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

// ──── ソース ────────────────────────────────────────────────
export interface SourceItem {
  title: string;
  url: string;
}

// ──── チャートデータ（根拠バッジ付き） ────────────────────
export interface ChartDataPoint {
  name: string;
  value: number;
  basis?: string;  // 科学的根拠・計算根拠テキスト（ホバー表示）
}

// ──── ティア表（エビデンスバッジ付き） ────────────────────
export type Tier = "S" | "A" | "B" | "C";

export interface TierItem {
  tier: Tier;
  action: string;   // 左側: 具体的アクション
  insight: string;  // 右側: 専門知識・科学的解説
  badge?: string;   // ホバーバッジ: 科学的エビデンス根拠テキスト
}

// ──── 思考プロセス（Gemini Thinking風） ────────────────────
export interface ThinkingStep {
  phase: string;       // フェーズ名（例: "問題定義", "手法選定"）
  reasoning: string;   // このフェーズでの推論（25語以内推奨）
  confidence: number;  // 確信度 0–100
}

export interface ThinkingProcess {
  steps: ThinkingStep[];
  summary: string;  // 思考全体のサマリー
}

// ──── コードアーティファクト（Claude Artifacts風） ─────────
export type CodeLanguage = "python" | "r" | "javascript" | "markdown" | "text";

export interface CodeArtifact {
  language: CodeLanguage;
  title: string;
  code: string;
  description?: string;
}

// ──── LLM レスポンス JSON（内部型） ────────────────────────
export interface LLMJsonResponse {
  success: boolean;
  field: string;
  method: string;
  metrics: string;
  explanation: string;
  detailedExplanation: string;
  practicalPlans: TierItem[];
  academicPlans: TierItem[];
  sources: SourceItem[];
  chartData: ChartDataPoint[];
  // ── 新規フィールド（null = LLMが出力しなかった場合） ──
  thinkingProcess?: ThinkingProcess | null;
  codeArtifact?: CodeArtifact | null;
}

// ──── API ルートのレスポンス ────────────────────────────────
export interface PredictResponse extends LLMJsonResponse {
  provider: LLMProvider;
  model: string;
  latencyMs: number;
  isFallback?: boolean;
  errorMessage?: string;
  fromCache?: boolean;
}

// ──── LLM プロバイダー共通インタフェース ────────────────────
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
