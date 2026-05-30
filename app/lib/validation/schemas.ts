import { z } from "zod";

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

export const SourceItemSchema = z.object({
  title: z.string().default(""),
  url: z.string().default(""),
});

// LLMが文字列配列・オブジェクト配列・nullなど何を返しても正規化する
const NormalizedSourcesSchema = z.preprocess((val) => {
  if (!Array.isArray(val)) return [];
  return val.map((item) => {
    if (typeof item === "string") {
      return { title: item, url: "" };
    }
    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      return {
        title: String(obj.title ?? obj.name ?? "学術ソース"),
        url: String(obj.url ?? ""),
      };
    }
    return { title: "不明なソース", url: "" };
  });
}, z.array(SourceItemSchema).optional().default([]));

export const ChartDataPointSchema = z.object({
  name: z.string(),
  value: z.number(),
});

// LLMが name/value 以外のキー名(metric, score, label等)を使っても正規化する
const NormalizedChartDataSchema = z.preprocess((val) => {
  if (!Array.isArray(val)) return [];
  return val.map((item) => {
    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      const nameKey =
        obj.name ?? obj.metric ?? obj.label ?? obj.axis ?? obj.key ?? obj.category ?? obj.indicator;
      const rawValue =
        obj.value ?? obj.score ?? obj.percentage ?? obj.amount ?? obj.val ?? obj.count ?? 0;
      const numValue = Number(rawValue);
      return {
        name: String(nameKey ?? "指標"),
        value: isNaN(numValue) ? 0 : numValue,
      };
    }
    return { name: "不明な指標", value: 0 };
  });
}, z.array(ChartDataPointSchema).optional().default([]));

// detailedExplanation: details / detail / fullExplanation / analysis 等も吸収
const NormalizedDetailedExplanationSchema = z.preprocess((val) => {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    const text =
      obj.detailedExplanation ??
      obj.details ??
      obj.detail ??
      obj.fullExplanation ??
      obj.detailed ??
      obj.analysis ??
      obj.deepDive ??
      "";
    return String(text);
  }
  return "";
}, z.string().optional().default(""));

// ━━━ ティアアイテム正規化 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const VALID_TIERS = ["S", "A", "B", "C"] as const;

/** LLM が tier/action/insight オブジェクトを何で返してきても正規化する */
function normalizeTierArray(val: unknown): { tier: string; action: string; insight: string }[] {
  // オブジェクト包み (LLM が {practicalPlans: [...]} 形式で返した場合)
  if (val && typeof val === "object" && !Array.isArray(val)) {
    const obj = val as Record<string, unknown>;
    const inner =
      obj.practicalPlans ?? obj.academicPlans ??
      obj.practical ?? obj.academic ?? obj.plans ?? obj.items;
    return normalizeTierArray(inner);
  }
  if (!Array.isArray(val)) return [];

  return val
    .map((item): { tier: string; action: string; insight: string } | null => {
      // --- 文字列の場合: Aティアに自動格納 ---
      if (typeof item === "string") {
        const trimmed = item.trim();
        if (!trimmed) return null;
        return { tier: "A", action: trimmed.replace(/^【.*?】\s*/, ""), insight: "" };
      }
      if (!item || typeof item !== "object") return null;

      const obj = item as Record<string, unknown>;

      // tier の正規化
      const rawTier = String(
        obj.tier ?? obj.rank ?? obj.level ?? obj.priority ?? obj.grade ?? "A"
      ).toUpperCase().trim();
      const tier = (VALID_TIERS as readonly string[]).includes(rawTier) ? rawTier : "A";

      // action の正規化
      const action = String(
        obj.action ?? obj.step ?? obj.task ?? obj.text ??
        obj.plan ?? obj.description ?? obj.content ?? obj.item ?? ""
      ).trim();

      // insight の正規化
      const insight = String(
        obj.insight ?? obj.explanation ?? obj.detail ?? obj.note ??
        obj.reason ?? obj.rationale ?? obj.knowledge ?? obj.comment ??
        obj.why ?? obj.science ?? ""
      ).trim();

      if (!action) return null;
      return { tier, action, insight };
    })
    .filter((x): x is { tier: string; action: string; insight: string } => x !== null);
}

const TierItemZodSchema = z.object({
  tier: z.enum(["S", "A", "B", "C"]).catch("A" as const),
  action: z.string().default(""),
  insight: z.string().default(""),
});

const NormalizedPracticalPlansSchema = z.preprocess(
  normalizeTierArray,
  z.array(TierItemZodSchema).optional().default([])
);

const NormalizedAcademicPlansSchema = z.preprocess(
  normalizeTierArray,
  z.array(TierItemZodSchema).optional().default([])
);

export const LLMJsonResponseSchema = z.object({
  success: z.boolean().optional().default(true),
  field: z.string().min(1).or(z.undefined()).transform((v) => v ?? "研究分野を取得できませんでした"),
  method: z.string().min(1).or(z.undefined()).transform((v) => v ?? "研究手法を取得できませんでした"),
  metrics: z.string().min(1).or(z.undefined()).transform((v) => v ?? "統計指標を取得できませんでした"),
  explanation: z.string().min(1).or(z.undefined()).transform((v) => v ?? "解説を取得できませんでした"),
  detailedExplanation: NormalizedDetailedExplanationSchema,
  practicalPlans: NormalizedPracticalPlansSchema,
  academicPlans: NormalizedAcademicPlansSchema,
  sources: NormalizedSourcesSchema,
  chartData: NormalizedChartDataSchema,
});

export type ValidatedPredictRequest = z.infer<typeof PredictRequestSchema>;
