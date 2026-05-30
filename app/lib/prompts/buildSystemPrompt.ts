import type { UserType, AgeGroup, Lang, ResearchDepth, Plan } from "@/app/types";
import { LANG_NAME_FOR_PROMPT } from "@/app/lib/i18n/translations";

type LevelConfig = {
  levelLabel: string;
  termStyle: string;
  statsStyle: string;
  academicFocus: string;
  codeHint: string;
  businessFocus?: string;
};

const LEVEL_CONFIGS: Record<UserType, LevelConfig> = {
  "中学生": {
    levelLabel:   "Middle school student (age 13-15)",
    termStyle:    "Plain, everyday language. Use analogies. Keep sentences short.",
    statsStyle:   "Only p-value, mean, percentage.",
    academicFocus:"school experiments, free-research projects, simple surveys",
    codeHint:     "Simple Python (no external libs). Prefer matplotlib.pyplot.",
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
    termStyle:    "Advanced academic language. English abbreviations OK.",
    statsStyle:   "Mixed-effects models, BIC, meta-analysis, Bayesian inference.",
    academicFocus:"OSF preregistration, R/Stan/Python, high-impact journal submission",
    codeHint:     "Python/R with advanced libs (statsmodels, sklearn, Stan). Include docstring.",
  },
  "大卒社会人": {
    levelLabel:   "Business professional (20s-30s)",
    termStyle:    "Business-first framing. ROI focus.",
    statsStyle:   "A/B test, regression, NPS, KPI tracking.",
    academicFocus:"Excel CORREL, Looker Studio, Google Analytics, market research",
    businessFocus:"Direct business ROI, team productivity, competitive advantage.",
    codeHint:     "Python with pandas/matplotlib for business data analysis.",
  },
  "大学院卒社会人": {
    levelLabel:   "Expert professional — DX/R&D specialist",
    termStyle:    "High-level technical + research language.",
    statsStyle:   "Causal inference (DiD, PSM), Bayesian opt, F1.",
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

const PLAN_INSTRUCTIONS: Record<Plan, string> = {
  personal:   "PLAN=Personal: Focus on individual daily habits, personal learning, self-improvement ROI.",
  enterprise: "PLAN=Enterprise: Emphasize team/org implementation, business KPIs, cost reduction.",
  researcher: "PLAN=Researcher: Prioritize statistical rigour, reproducibility, publication potential.",
};

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
    ? `"sources": MANDATORY — 6 to 10 objects. Each MUST be a REAL, world-class authoritative reference with a WORKING URL. Structure: [{title:"<Author(s) (Year). Full Title. Journal, Volume(Issue), Pages.>", url:"<real verifiable URL — prefer https://doi.org/xxx or https://pubmed.ncbi.nlm.nih.gov/xxx>", journal:"<journal/org name>", year:"<YYYY>", doi:"<DOI string if known>"}].
PRIORITY ORDER for source selection (use highest-tier first):
① Meta-analysis or Systematic Review in: Nature, Science, Cell, NEJM, Lancet, JAMA, BMJ, Nature Medicine, Nature Human Behaviour, PNAS
② RCT or Cohort study in: Cochrane Database, PLOS Medicine, PLOS ONE, Scientific Reports
③ Authoritative org guidelines: WHO (who.int), NIH (nih.gov), CDC (cdc.gov), UNESCO, OECD, World Bank data, Government white papers
④ Foundational textbooks cited via Google Scholar: Scholar URL = https://scholar.google.com/scholar?q=<url-encoded-title>
⑤ Wikipedia for definitional anchors: https://en.wikipedia.org/wiki/<Topic>
URL RULES: NEVER fabricate DOIs. If unsure of exact DOI, use PubMed search https://pubmed.ncbi.nlm.nih.gov/?term=<encoded-keywords> OR Google Scholar URL. Always include at least 6 sources with https:// links.`
    : `"sources": empty array [].`;

  const chartRule = showChart
    ? `"chartData": 4-6 objects {name, value(0-100), basis:"<15-word scientific evidence for this score>"}. basis MUST explain WHY this score exists (cite model/theory/study name).`
    : `"chartData": empty array [].`;

  const tierCount   = isDeep ? "6-8" : "4-6";
  const deepInsight = isDeep ? ` Each insight MUST include: (1) key risk/caveat, (2) one alternative approach.` : "";
  const deepDetail  = isDeep
    ? `Deep mode: detailedExplanation 200-280 words. Add: counter-evidence, limitations, alternatives.`
    : `Standard mode: detailedExplanation 120-180 words. Cover mechanism → evidence → limitation → conclusion.`;

  const businessBlock = cfg.businessFocus ? `Business focus: ${cfg.businessFocus}\n` : "";

  // ── 思考プロセス ────────────────────────────────────────
  const thinkingCount = isDeep ? 3 : 2;
  const thinkingRule = `"thinkingProcess":{"steps":[/* ${thinkingCount} objects */{"phase":"<3-word phase>","reasoning":"<max 25 words>","confidence":<0-100>}],"summary":"<1-sentence>"}`;

  // ── コードアーティファクト ──────────────────────────────
  const codeRule = `"codeArtifact": null if not applicable, else {"language":"python|r|javascript|markdown|text","title":"<title>","code":"<5-12 lines, ${cfg.codeHint} Escape \\n>","description":"<1 sentence>"}`;

  // ── ソース選択バナー（常時） ───────────────────────────
  const selectedSourcesRule = `"selectedSources": 2-3 objects [{domainName:"<authoritative domain e.g. ncbi.nlm.nih.gov>", reliabilityScore:<60-99>, reasonForSelection:"<max 8 words>"}] — identify the most authoritative databases/journals for this topic.`;

  // ── 零努力チート（常時） ────────────────────────────────
  const zeroEffortRule = `"zeroEffortCheat": 2-3 objects [{tediousTask:"<what user normally must struggle with, max 12 words>", shortcutHack:"<AI/tool bypass that eliminates this in seconds, max 18 words>", savedHours:"<e.g. XX時間削減>"}] — identify the most painful friction points and AI-powered shortcuts.`;

  // ── Deep モード専用フィールド ───────────────────────────
  const deepFields = isDeep ? `
DEEP MODE INTELLIGENCE MATRIX:
9. "financialSimulation": 4 objects [{year:"20XX", marketSizeBillions:<N.N>, projectedROI:<N>, alphaCaptureRate:<N>}] — simulated 5-year market/ROI projection if this research is commercialized.
10. "literatureGapMatrix": 3 objects [{domain:"<field>", unresolvedQuestion:"<key unresolved gap, max 15 words>", evidenceLevel:"RCT|Meta|Cohort|Expert|Theoretical", citationAnchor:"<Author et al. YYYY>"}]
11. "systemicRisks": 3 objects [{nodeName:"<risk name, max 4 words>", dependencyWeight:<0-100>, failureProbability:<0-100>, mitigationStrategy:"<strategy, max 12 words>"}]` : `
9. "financialSimulation": null
10. "literatureGapMatrix": null
11. "systemicRisks": null`;

  return `You are the sovereign intelligence core engine of scia-nexus® — a world-class scientific research advisor.
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
   Each: {"tier":"S|A|B|C","action":"<specific tool/time/number>","insight":"<mechanism>${deepInsight}","badge":"<8-12 word scientific basis for tier rank>"}
4. academicPlans — ${tierCount} tier objects for ${cfg.academicFocus}.
   Same structure. badge explains the evidence tier rank.${deepInsight}
5. ${sourcesRule}
6. ${chartRule}
7. ${thinkingRule}
8. ${codeRule}

INTELLIGENCE MATRIX (ALWAYS INCLUDE — these are mandatory):
7b. ${selectedSourcesRule}
7c. ${zeroEffortRule}
${deepFields}

CRITICAL FORMAT:
Return ONLY valid JSON. No markdown. No text outside JSON. Start { end }.
Mandatory 15-key structure:
{"success":true,"field":"...","method":"...","metrics":"...","explanation":"...","detailedExplanation":"...","practicalPlans":[{"tier":"S","action":"...","insight":"...","badge":"..."}],"academicPlans":[{"tier":"S","action":"...","insight":"...","badge":"..."}],"sources":[{"title":"Author(s) (Year). Title. Journal.","url":"https://doi.org/xxx","journal":"Nature","year":"2023","doi":"10.1038/..."},{"title":"...","url":"https://pubmed.ncbi.nlm.nih.gov/?term=...","journal":"NEJM","year":"2022"},{"title":"...","url":"https://www.who.int/...","journal":"WHO","year":"2024"},{"title":"...","url":"https://en.wikipedia.org/wiki/...","journal":"Wikipedia"},{"title":"...","url":"https://scholar.google.com/scholar?q=...","journal":"Google Scholar"},{"title":"...","url":"https://pubmed.ncbi.nlm.nih.gov/?term=...","journal":"PubMed"}],"chartData":[],"thinkingProcess":{"steps":[{"phase":"...","reasoning":"...","confidence":85}],"summary":"..."},"codeArtifact":null,"selectedSources":[{"domainName":"ncbi.nlm.nih.gov","reliabilityScore":95,"reasonForSelection":"..."}],"zeroEffortCheat":[{"tediousTask":"...","shortcutHack":"...","savedHours":"XX時間削減"}],"financialSimulation":null,"literatureGapMatrix":null,"systemicRisks":null}`;
}
