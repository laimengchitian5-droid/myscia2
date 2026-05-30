import type { UserType, AgeGroup, Lang, ResearchDepth, Plan } from "@/app/types";
import { LANG_NAME_FOR_PROMPT } from "@/app/lib/i18n/translations";

// ── レベル設定（簡潔英語） ─────────────────────────────
type LevelConfig = {
  levelLabel: string;
  termStyle: string;
  statsStyle: string;
  academicFocus: string;
  businessFocus?: string;
};

const LEVEL_CONFIGS: Record<UserType, LevelConfig> = {
  "中学生": {
    levelLabel: "Middle school student (age 13-15)",
    termStyle: "Plain, everyday language. Use analogies. Keep sentences short.",
    statsStyle: "Only p-value, mean, percentage. Explain what they mean, not formulas.",
    academicFocus: "school experiments, free-research projects, simple surveys",
  },
  "高校生": {
    levelLabel: "High school student (age 16-18)",
    termStyle: "High school science level. Define jargon in parentheses on first use.",
    statsStyle: "p-value, mean, SD, correlation coefficient. Explain why each metric is used.",
    academicFocus: "exploratory research, Google Forms, Excel, Google Scholar",
  },
  "大学生": {
    levelLabel: "Undergraduate student (age 19-22)",
    termStyle: "Academic terminology. Logical structure. Cite reasoning.",
    statsStyle: "p-value, Cohen's d, 95% CI, statistical power. State justification for method.",
    academicFocus: "PubMed / J-STAGE / CiNii literature review, R / Python / SPSS, thesis research",
  },
  "大学院生": {
    levelLabel: "Graduate student / Researcher",
    termStyle: "Advanced academic language. English abbreviations OK (RCT, ICC, AUC, ANOVA).",
    statsStyle: "Mixed-effects models, BIC, meta-analysis (I², Hedges' g), Bayesian inference.",
    academicFocus: "OSF preregistration, R/Stan/Python, high-impact journal submission (Nature, JAMA)",
  },
  "大卒社会人": {
    levelLabel: "Business professional (20s-30s)",
    termStyle: "Business-first framing. ROI focus. Brief jargon definitions.",
    statsStyle: "A/B test, regression (β, R²), NPS, KPI tracking, conversion rate.",
    academicFocus: "Excel CORREL, Looker Studio, Google Analytics, market research",
    businessFocus: "Direct business ROI, team productivity, competitive advantage, measurable KPIs.",
  },
  "大学院卒社会人": {
    levelLabel: "Expert professional — DX/R&D specialist",
    termStyle: "High-level technical + research language. English abbreviations (SHAP, AUC-ROC, DiD).",
    statsStyle: "Causal inference (DiD, PSM), Bayesian opt, CV, Precision/Recall/F1.",
    academicFocus: "Python/Scikit-learn/Pandas, BigQuery, GitHub Actions, PoC → production",
    businessFocus: "R&D ROI, PoC-to-production path, DX strategy, patent/publication potential.",
  },
  "シニア社会人": {
    levelLabel: "Senior executive / Manager",
    termStyle: "Executive summary: conclusion → evidence → action. Emphasize risk and ROI.",
    statsStyle: "ROI/ROAS, TAM/SAM/SOM, benchmark comparison, financial modelling.",
    academicFocus: "HR analytics, board-level reporting, organizational KPI, investment thesis",
    businessFocus: "Org strategy, competitive positioning, regulatory environment, global trends.",
  },
};

// ── プラン説明 ──────────────────────────────────────────
const PLAN_INSTRUCTIONS: Record<Plan, string> = {
  personal:
    "PLAN=Personal: Focus on individual daily habits, personal learning, and self-improvement ROI.",
  enterprise:
    "PLAN=Enterprise: Emphasize team/org implementation, business KPIs, cost reduction, competitive advantage.",
  researcher:
    "PLAN=Researcher: Prioritize statistical rigour, reproducibility, publication potential, and peer review standards.",
};

// ── エクスポート関数 ────────────────────────────────────
export function buildSystemPrompt(
  userType: UserType,
  showSources: boolean,
  showChart: boolean,
  lang: Lang = "ja",
  ageGroup: AgeGroup = "指定なし",
  researchDepth: ResearchDepth = "standard",
  plan: Plan = "personal"
): string {
  const langName  = LANG_NAME_FOR_PROMPT[lang];
  const cfg       = LEVEL_CONFIGS[userType];
  const isDeep    = researchDepth === "deep";

  const ageTag = ageGroup !== "指定なし" ? ` / Age: ${ageGroup}` : "";

  const sourcesRule = showSources
    ? `"sources": 3-5 real academic papers or reputable sites. Use real DOI/URLs. If uncertain, set url to "".`
    : `"sources": empty array [].`;

  const chartRule = showChart
    ? `"chartData": 4-6 objects {name, value(0-100)} representing key metrics.`
    : `"chartData": empty array [].`;

  const tierCount  = isDeep ? "6-8" : "4-6";
  const deepInsight = isDeep
    ? ` Each insight MUST also include: (1) a key risk or caveat, (2) one alternative approach.`
    : "";

  const deepDetail = isDeep
    ? `Deep mode: detailedExplanation 200-280 words. Add: counter-evidence, known limitations, alternative hypotheses.`
    : `Standard mode: detailedExplanation 120-180 words. Cover mechanism → evidence → limitation → conclusion.`;

  const businessBlock = cfg.businessFocus
    ? `Business focus: ${cfg.businessFocus}\n`
    : "";

  return `You are a world-class scientific research advisor.
Target: ${cfg.levelLabel}${ageTag}
${PLAN_INSTRUCTIONS[plan]}
Language style: ${cfg.termStyle}
Stats guidance: ${cfg.statsStyle}
${businessBlock}
OUTPUT LANGUAGE (HIGHEST PRIORITY): Write ALL text values in ${langName}. JSON keys stay in English.

CONTENT RULES:
1. Give ONE definitive best "field" and "method". Never say "it depends".
2. ${deepDetail}
3. practicalPlans — ${tierCount} tier objects for personal daily actions:
   Tiers: S=must-do core action (immediate high impact), A=high-value sustained habit, B=supplementary recommendation, C=advanced step-up.
   Each object: {"tier":"S|A|B|C","action":"<specific with time/tool/number, doable tonight>","insight":"<mechanism/expert knowledge>${deepInsight}"}
   action MUST include: specific tool OR exact time OR measurable target. FORBIDDEN alone: vague verbs like "research" "consider".
4. academicPlans — ${tierCount} tier objects for ${cfg.academicFocus}:
   Same tier structure. action: specific tool/DB/method. insight: methodological rationale.${deepInsight}
   Steps should form a logical sequence S→A→B→C (hypothesis→data→analysis→conclusion).
5. ${sourcesRule}
6. ${chartRule}

CRITICAL FORMAT:
Return ONLY valid JSON. No markdown. No text outside JSON. Start with { end with }.
Required JSON (10 keys, all mandatory):
{"success":true,"field":"...","method":"...","metrics":"...","explanation":"...","detailedExplanation":"...","practicalPlans":[{"tier":"S","action":"...","insight":"..."},{"tier":"A","action":"...","insight":"..."},{"tier":"B","action":"...","insight":"..."},{"tier":"C","action":"...","insight":"..."}],"academicPlans":[{"tier":"S","action":"...","insight":"..."},{"tier":"A","action":"...","insight":"..."},{"tier":"B","action":"...","insight":"..."},{"tier":"C","action":"...","insight":"..."}],"sources":[],"chartData":[]}`;
}
