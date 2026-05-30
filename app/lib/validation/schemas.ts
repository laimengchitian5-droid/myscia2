import { z } from "zod";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  リクエストスキーマ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const UserTypeSchema = z.enum([
  "中学生", "高校生", "大学生", "大学院生",
  "大卒社会人", "大学院卒社会人", "シニア社会人",
]);

export const AgeGroupSchema = z.enum([
  "指定なし",
  "15〜19歳", "20〜24歳", "25〜29歳", "30〜34歳", "35〜39歳",
  "40〜44歳", "45〜49歳", "50代", "60代以上",
]).optional().default("指定なし");

export const PredictRequestSchema = z.object({
  question: z
    .string()
    .min(3, "質問は3文字以上入力してください")
    .max(500, "質問は500文字以内にしてください"),
  userType: UserTypeSchema,
  showSources: z.boolean(),
  showChart: z.boolean(),
  ageGroup: AgeGroupSchema,
  provider: z
    .enum(["groq", "openai", "anthropic", "gemini"])
    .optional()
    .default("groq"),
  lang: z.enum(["ja", "en", "zh", "ko"]).optional().default("ja"),
  researchDepth: z.enum(["standard", "deep"]).optional().default("standard"),
  plan: z.enum(["personal", "enterprise", "researcher"]).optional().default("personal"),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ソース正規化
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SourceItemSchema = z.object({
  title: z.string().default(""),
  url: z.string().default(""),
});

const NormalizedSourcesSchema = z.preprocess((val) => {
  if (!Array.isArray(val)) return [];
  return val.map((item) => {
    if (typeof item === "string") return { title: item, url: "" };
    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      return { title: String(obj.title ?? obj.name ?? "学術ソース"), url: String(obj.url ?? "") };
    }
    return { title: "不明なソース", url: "" };
  });
}, z.array(SourceItemSchema).optional().default([]));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  チャートデータ正規化（basis フィールド追加）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ChartDataPointSchema = z.object({
  name:  z.string(),
  value: z.number(),
  basis: z.string().optional(),  // 科学的根拠バッジ
});

const NormalizedChartDataSchema = z.preprocess((val) => {
  if (!Array.isArray(val)) return [];
  return val.map((item) => {
    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      const nameKey =
        obj.name ?? obj.metric ?? obj.label ?? obj.axis ??
        obj.key ?? obj.category ?? obj.indicator;
      const rawValue =
        obj.value ?? obj.score ?? obj.percentage ?? obj.amount ??
        obj.val ?? obj.count ?? 0;
      const numValue = Number(rawValue);
      return {
        name:  String(nameKey ?? "指標"),
        value: isNaN(numValue) ? 0 : numValue,
        basis: obj.basis ? String(obj.basis) : undefined,
      };
    }
    return { name: "不明な指標", value: 0 };
  });
}, z.array(ChartDataPointSchema).optional().default([]));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  detailedExplanation 正規化
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const NormalizedDetailedExplanationSchema = z.preprocess((val) => {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    const text =
      obj.detailedExplanation ?? obj.details ?? obj.detail ??
      obj.fullExplanation ?? obj.detailed ?? obj.analysis ?? obj.deepDive ?? "";
    return String(text);
  }
  return "";
}, z.string().optional().default(""));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ティアアイテム正規化（badge フィールド追加）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const VALID_TIERS = ["S", "A", "B", "C"] as const;

function normalizeTierArray(
  val: unknown
): { tier: string; action: string; insight: string; badge?: string }[] {
  // オブジェクト包みを解く
  if (val && typeof val === "object" && !Array.isArray(val)) {
    const obj = val as Record<string, unknown>;
    const inner =
      obj.practicalPlans ?? obj.academicPlans ??
      obj.practical ?? obj.academic ?? obj.plans ?? obj.items;
    return normalizeTierArray(inner);
  }
  if (!Array.isArray(val)) return [];

  return val
    .map((item): { tier: string; action: string; insight: string; badge?: string } | null => {
      if (typeof item === "string") {
        const trimmed = item.trim();
        if (!trimmed) return null;
        return { tier: "A", action: trimmed.replace(/^【.*?】\s*/, ""), insight: "" };
      }
      if (!item || typeof item !== "object") return null;

      const obj = item as Record<string, unknown>;

      const rawTier = String(
        obj.tier ?? obj.rank ?? obj.level ?? obj.priority ?? obj.grade ?? "A"
      ).toUpperCase().trim();
      const tier = (VALID_TIERS as readonly string[]).includes(rawTier) ? rawTier : "A";

      const action = String(
        obj.action ?? obj.step ?? obj.task ?? obj.text ??
        obj.plan ?? obj.description ?? obj.content ?? obj.item ?? ""
      ).trim();

      const insight = String(
        obj.insight ?? obj.explanation ?? obj.detail ?? obj.note ??
        obj.reason ?? obj.rationale ?? obj.knowledge ?? obj.comment ??
        obj.why ?? obj.science ?? ""
      ).trim();

      // badge（科学的根拠バッジ）の正規化
      const badge = obj.badge ? String(obj.badge).trim() : undefined;

      if (!action) return null;
      return { tier, action, insight, badge };
    })
    .filter(
      (x): x is { tier: string; action: string; insight: string; badge?: string } => x !== null
    );
}

const TierItemZodSchema = z.object({
  tier:    z.enum(["S", "A", "B", "C"]).catch("A" as const),
  action:  z.string().default(""),
  insight: z.string().default(""),
  badge:   z.string().optional(),  // 科学的エビデンスバッジ
});

const NormalizedPracticalPlansSchema = z.preprocess(
  normalizeTierArray,
  z.array(TierItemZodSchema).optional().default([])
);

const NormalizedAcademicPlansSchema = z.preprocess(
  normalizeTierArray,
  z.array(TierItemZodSchema).optional().default([])
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ThinkingProcess スキーマ（Gemini Thinking風）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ThinkingStepSchema = z.object({
  phase: z.preprocess(
    (v) => (typeof v === "string" ? v : "分析"),
    z.string().min(1).catch("分析")
  ),
  reasoning: z.preprocess(
    (v) => (typeof v === "string" ? v : ""),
    z.string().catch("")
  ),
  confidence: z.preprocess(
    (v) => {
      const n = typeof v === "number" ? v : parseInt(String(v), 10);
      return isNaN(n) ? 75 : Math.min(100, Math.max(0, n));
    },
    z.number().min(0).max(100).catch(75)
  ),
});

const ThinkingProcessSchema = z.preprocess(
  (val) => {
    if (!val || typeof val !== "object") return null;
    const obj = val as Record<string, unknown>;
    return {
      steps:   Array.isArray(obj.steps) ? obj.steps : [],
      summary: typeof obj.summary === "string" ? obj.summary : "",
    };
  },
  z.object({
    steps:   z.array(ThinkingStepSchema).max(6).catch([]),
    summary: z.string().catch(""),
  }).nullable().optional()
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  CodeArtifact スキーマ（Claude Artifacts風）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CODE_LANGUAGES = ["python", "r", "javascript", "markdown", "text"] as const;

const CodeArtifactSchema = z.preprocess(
  (val) => {
    if (!val || typeof val !== "object") return null;
    const obj = val as Record<string, unknown>;
    if (!obj.code || typeof obj.code !== "string" || !obj.code.trim()) return null;
    return {
      language:    CODE_LANGUAGES.includes(obj.language as typeof CODE_LANGUAGES[number])
                     ? obj.language
                     : "python",
      title:       typeof obj.title === "string" ? obj.title : "コードプレビュー",
      code:        String(obj.code),
      description: typeof obj.description === "string" ? obj.description : undefined,
    };
  },
  z.object({
    language:    z.enum(CODE_LANGUAGES).catch("python" as const),
    title:       z.string().catch("コードプレビュー"),
    code:        z.string().min(1).catch("# No code available"),
    description: z.string().optional(),
  }).nullable().optional()
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  LLMJsonResponse スキーマ（全フィールド統合）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const LLMJsonResponseSchema = z.object({
  success:             z.boolean().optional().default(true),
  field:               z.string().min(1).or(z.undefined()).transform((v) => v ?? "研究分野を取得できませんでした"),
  method:              z.string().min(1).or(z.undefined()).transform((v) => v ?? "研究手法を取得できませんでした"),
  metrics:             z.string().min(1).or(z.undefined()).transform((v) => v ?? "統計指標を取得できませんでした"),
  explanation:         z.string().min(1).or(z.undefined()).transform((v) => v ?? "解説を取得できませんでした"),
  detailedExplanation: NormalizedDetailedExplanationSchema,
  practicalPlans:      NormalizedPracticalPlansSchema,
  academicPlans:       NormalizedAcademicPlansSchema,
  sources:             NormalizedSourcesSchema,
  chartData:           NormalizedChartDataSchema,
  // ── 新規フィールド（undefined / null 両対応） ──
  thinkingProcess:     ThinkingProcessSchema,
  codeArtifact:        CodeArtifactSchema,
});

export type ValidatedPredictRequest = z.infer<typeof PredictRequestSchema>;
