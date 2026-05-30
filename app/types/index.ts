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

// ──── ソース（権威文献・ハイパーリンク対応） ──────────────
export interface SourceItem {
  title:   string;
  url:     string;
  journal?: string;  // 掲載誌名（例: "Nature", "NEJM"）
  year?:   string;   // 発行年（例: "2023"）
  doi?:    string;   // DOI（例: "10.1038/s41586-023-XXXXX"）
}

// ──── チャートデータ（根拠バッジ付き） ────────────────────
export interface ChartDataPoint {
  name: string;
  value: number;
  basis?: string;
}

// ──── ティア表（エビデンスバッジ付き） ────────────────────
export type Tier = "S" | "A" | "B" | "C";

export interface TierItem {
  tier: Tier;
  action: string;
  insight: string;
  badge?: string;
}

// ──── 思考プロセス（Gemini Thinking風） ────────────────────
export interface ThinkingStep {
  phase: string;
  reasoning: string;
  confidence: number;
}

export interface ThinkingProcess {
  steps: ThinkingStep[];
  summary: string;
}

// ──── コードアーティファクト（Claude Artifacts風） ─────────
export type CodeLanguage = "python" | "r" | "javascript" | "markdown" | "text";

export interface CodeArtifact {
  language: CodeLanguage;
  title: string;
  code: string;
  description?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  新時代インテリジェンス・マトリクス型定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 権威ある情報ソース（MATRIX SOURCE ACTIVATION バナー用） */
export interface SelectedSource {
  domainName: string;        // e.g. "ncbi.nlm.nih.gov/pubmed"
  reliabilityScore: number;  // 0-100
  reasonForSelection: string;
}

/** 努力ゼロ化・新時代裏ルート（Zero-Effort Cheat） */
export interface ZeroEffortCheatItem {
  tediousTask: string;   // 本来なら直面する「めんどくさい努力・悩み」
  shortcutHack: string;  // AIが代わりに一瞬で終わらせる「チート級裏ワザ」
  savedHours: string;    // 物理的に浮く時間（例: "30時間削減"）
}

/** Bloomberg風：金融・市場シミュレーション */
export interface FinancialSimulationItem {
  year: string;
  marketSizeBillions: number;  // 市場規模 (10億ドル)
  projectedROI: number;        // 予測ROI (%)
  alphaCaptureRate: number;    // アルファ捕捉率 (%)
}

/** PubMed風：文献ギャップ・マトリクス */
export interface LiteratureGapItem {
  domain: string;             // 研究領域
  unresolvedQuestion: string; // 未解決の問い
  evidenceLevel: string;      // "RCT" | "Meta" | "Cohort" | "Expert" など
  citationAnchor: string;     // 代表的引用（Author et al. YYYY）
}

/** Palantir風：システミックリスク・マトリクス */
export interface SystemicRiskItem {
  nodeName: string;            // リスクノード名
  dependencyWeight: number;    // 依存度 0-100
  failureProbability: number;  // 障害発生確率 0-100
  mitigationStrategy: string;  // 緩和戦略
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
  // Gemini Thinking
  thinkingProcess?: ThinkingProcess | null;
  // Claude Artifacts
  codeArtifact?: CodeArtifact | null;
  // ── インテリジェンス・マトリクス（新規） ──
  selectedSources?: SelectedSource[] | null;
  zeroEffortCheat?: ZeroEffortCheatItem[] | null;
  financialSimulation?: FinancialSimulationItem[] | null;   // Deep mode
  literatureGapMatrix?: LiteratureGapItem[] | null;          // Deep mode
  systemicRisks?: SystemicRiskItem[] | null;                 // Deep mode
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
