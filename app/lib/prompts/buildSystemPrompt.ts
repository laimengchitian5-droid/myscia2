import type { UserType, AgeGroup, Lang, ResearchDepth, Plan } from "@/app/types";
import { LANG_NAME_FOR_PROMPT } from "@/app/lib/i18n/translations";

// ── レベル設定 ──────────────────────────────────────────────
type LevelConfig = {
  levelLabel: string;
  termStyle: string;
  statsStyle: string;
  academicFocus: string;
  codeHint: string;         // コードアーティファクト用のヒント
  businessFocus?: string;
};

const LEVEL_CONFIGS: Record<UserType, LevelConfig> = {
  "中学生": {
    levelLabel:   "Middle school student (age 13-15)",
    termStyle:    "Plain, everyday language. Use analogies. Keep sentences short.",
    statsStyle:   "Only p-value, mean, percentage. Explain what they mean, not formulas.",
    academicFocus:"school experiments, free-research projects, simple surveys",
    codeHint:     "Simple Python (no external libs). Prefer matplotlib.pyplot for visualization.",
  },
  "高校生": {
    levelLabel:   "High school student (age 16-18)",
    termStyle:    "High school science level. Define jargon in parentheses on first use.",
    statsStyle:   "p-value, mean, SD, correlation coefficient.",
    academicFocus:"exploratory research, Google Forms, Excel, Google Scholar",
    codeHint:     "Python with numpy/matplotlib. Keep code under 15 lines.",
  },
  "大学生": {
    levelLabel:   "Undergraduate student (age 19-22)",
    termStyle:    "Academic terminology. Logical structure. Cite reasoning.",
    statsStyle:   "p-value, Cohen's d, 95% CI, statistical power.",
    academicFocus:"PubMed / J-STAGE / CiNii, R / Python / SPSS, thesis research",
    codeHint:     "Python with scipy/statsmodels/pandas. Include brief comments.",
  },
  "大学院生": {
    levelLabel:   "Graduate student / Researcher",
    termStyle:    "Advanced academic language. English abbreviations OK (RCT, ICC, AUC, ANOVA).",
    statsStyle:   "Mixed-effects models, BIC, meta-analysis, Bayesian inference.",
    academicFocus:"OSF preregistration, R/Stan/Python, high-impact journal submission",
    codeHint:     "Python/R with advanced libs (statsmodels, sklearn, Stan). Include docstring.",
  },
  "大卒社会人": {
    levelLabel:   "Business professional (20s-30s)",
    termStyle:    "Business-first framing. ROI focus. Brief jargon definitions.",
    statsStyle:   "A/B test, regression, NPS, KPI tracking, conversion rate.",
    academicFocus:"Excel CORREL, Looker Studio, Google Analytics, market research",
    businessFocus:"Direct business ROI, team productivity, competitive advantage.",
    codeHint:     "Python with pandas/matplotlib for business data analysis.",
  },
  "大学院卒社会人": {
    levelLabel:   "Expert professional — DX/R&D specialist",
    termStyle:    "High-level technical + research language.",
    statsStyle:   "Causal inference (DiD, PSM), Bayesian opt, CV, Precision/Recall/F1.",
    academicFocus:"Python/Scikit-learn/Pandas, BigQuery, GitHub Actions",
    businessFocus:"R&D ROI, PoC-to-production path, DX strategy.",
    codeHint:     "Python with scikit-learn/torch. Production-quality code with type hints.",
  },
  "シニア社会人": {
    levelLabel:   "Senior executive / Manager",
    termStyle:    "Executive summary: conclusion → evidence → action.",
    statsStyle:   "ROI/ROAS, TAM/SAM/SOM, benchmark comparison.",
    academicFocus:"HR analytics, board-level reporting, organizational KPI",
    businessFocus:"Org strategy, competitive positioning, investment thesis.",
    codeHint:     "Python for executive dashboards. Keep code minimal and commented.",
  },
};

// ── プラン説明 ──────────────────────────────────────────────
const PLAN_INSTRUCTIONS: Record<Plan, string> = {
  personal:
    "PLAN=Personal: Focus on individual daily habits, personal learning, and self-improvement ROI.",
  enterprise:
    "PLAN=Enterprise: Emphasize team/org implementation, business KPIs, cost reduction.",
  researcher:
    "PLAN=Researcher: Prioritize statistical rigour, reproducibility, publication potential.",
};

// ── エクスポート関数 ────────────────────────────────────────
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
  const ageTag    = ageGroup !== "指定なし" ? ` / Age: ${ageGroup}` : "";

  const sourcesRule = showSources
    ? `"sources": 3-5 real academic papers or reputable sites. Real DOI/URLs if possible.`
    : `"sources": empty array [].`;

  const chartRule = showChart
    ? `"chartData": 4-6 objects {name, value(0-100), basis:"<15-word scientific evidence for this score>"}. `
    + `basis MUST explain WHY this score exists (cite model/theory/study name).`
    : `"chartData": empty array [].`;

  const tierCount   = isDeep ? "6-8" : "4-6";
  const deepInsight = isDeep
    ? ` Each insight MUST include: (1) key risk/caveat, (2) one alternative approach.`
    : "";

  const deepDetail = isDeep
    ? `Deep mode: detailedExplanation 200-280 words. Add: counter-evidence, limitations, alternatives.`
    : `Standard mode: detailedExplanation 120-180 words. Cover mechanism → evidence → limitation → conclusion.`;

  const businessBlock = cfg.businessFocus ? `Business focus: ${cfg.businessFocus}\n` : "";

  // ── 思考プロセス指示 ─────────────────────────────────────
  const thinkingStepCount = isDeep ? 3 : 2;
  const thinkingRule = `"thinkingProcess": {
  "steps": [/* ${thinkingStepCount} objects: */
    {"phase":"<3-word phase name>","reasoning":"<max 25 words explaining THIS step's key decision>","confidence":<0-100>},
    ...
  ],
  "summary":"<1-sentence meta-summary of overall reasoning chain>"
}`;

  // ── コードアーティファクト指示 ───────────────────────────
  const codeRule = `"codeArtifact": (INCLUDE only if question involves data analysis, experiment, or modeling — else set null)
{
  "language":"python|r|javascript|markdown|text",
  "title":"<artifact title>",
  "code":"<5-12 lines of ${cfg.codeHint} Escape newlines as \\n.>",
  "description":"<1-sentence describing what this code does>"
}`;

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
3. practicalPlans — ${tierCount} tier objects for personal daily actions.
   Each: {"tier":"S|A|B|C","action":"<specific tool/time/number>","insight":"<mechanism>${deepInsight}","badge":"<8-12 word scientific basis for why this tier assignment>"}
   action MUST include: specific tool OR exact time OR measurable target.
4. academicPlans — ${tierCount} tier objects for ${cfg.academicFocus}.
   Same structure as practicalPlans. badge explains the evidence tier rank.${deepInsight}
5. ${sourcesRule}
6. ${chartRule}

NEW REQUIRED FIELDS:
7. ${thinkingRule}
8. ${codeRule}

CRITICAL FORMAT:
Return ONLY valid JSON. No markdown. No text outside JSON. Start { end }.
Required JSON (12 keys — all mandatory):
{"success":true,"field":"...","method":"...","metrics":"...","explanation":"...","detailedExplanation":"...","practicalPlans":[{"tier":"S","action":"...","insight":"...","badge":"..."},{"tier":"A","action":"...","insight":"...","badge":"..."},{"tier":"B","action":"...","insight":"...","badge":"..."},{"tier":"C","action":"...","insight":"...","badge":"..."}],"academicPlans":[{"tier":"S","action":"...","insight":"...","badge":"..."},{"tier":"A","action":"...","insight":"...","badge":"..."},{"tier":"B","action":"...","insight":"...","badge":"..."},{"tier":"C","action":"...","insight":"...","badge":"..."}],"sources":[],"chartData":[],"thinkingProcess":{"steps":[{"phase":"...","reasoning":"...","confidence":85}],"summary":"..."},"codeArtifact":null}`;
}
