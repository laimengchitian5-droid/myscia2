import type { UserType, AgeGroup, Lang } from "@/app/types";
import { LANG_NAME_FOR_PROMPT } from "@/app/lib/i18n/translations";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  学生向けレベル設定
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type LevelConfig = {
  levelLabel: string;
  termStyle: string;
  statsStyle: string;
  actionPlansGuide: string;
  businessFocus?: string;
};

const STUDENT_LEVEL_CONFIG: Partial<Record<UserType, LevelConfig>> = {
  中学生: {
    levelLabel: "中学生（13〜15歳）",
    termStyle:
      "難しい専門用語は使わず、中学生が理解できる平易な言葉で説明してください。比喩や身近な例え話を積極的に使い、1文を短く保ってください。",
    statsStyle:
      "統計指標は「p値」「平均」「割合(%)」程度の基本的なものだけに絞り、計算式ではなく「何を意味するか」を中心に説明してください。",
    actionPlansGuide: `actionPlansには、【日常で今夜から試せること】と【自由研究・学校の実験に使えること】を混ぜて3〜5件出力してください。
RULES:
- 各項目は必ず「【日常実践】」または「【自由研究】」のどちらかのタグで始めること。
- 道具・時間・場所を具体的に書く（例：「スマホのアラームを7時にセットして…」「家族3人に協力してもらい…」）。
- 「調べる」「考える」などの曖昧な動詞を使わず、「計測する」「グラフに書く」「記録する」など行動動詞で書く。
- 小学生でも真似できるくらいシンプルな言葉で。
EXAMPLE FORMAT (このフォーマットを参考にするが、内容は疑問に合わせて変える):
"【日常実践】朝起きてすぐにカーテンを開け、15分間太陽の光を浴びて体内時計をリセットする。",
"【日常実践】布団に入ったらスマホの画面を絶対に見ない、と家族と約束してルールを紙に書いて貼る。",
"【自由研究】家族3人に協力してもらい、寝る前のスマホの有無で翌朝の目覚めのスッキリ度（1〜5点）を1週間記録してグラフにまとめる。"`,
  },
  高校生: {
    levelLabel: "高校生（16〜18歳）",
    termStyle:
      "高校の理科・数学レベルの知識を前提に、専門用語は初出時に必ず括弧で補足説明してください。",
    statsStyle:
      "p値、平均値、標準偏差、相関係数程度の基本統計量を使い、「なぜこの指標を使うのか」の理由も1文添えてください。",
    actionPlansGuide: `actionPlansには、【日常で今週から試せること】と【課題研究・探究学習に使えること】を混ぜて3〜5件出力してください。
RULES:
- 各項目は必ず「【日常実践】」または「【課題研究】」のタグで始めること。
- アプリ名・ウェブサイト名・具体的な数値（例：「14時以降のカフェイン摂取を停止」「Googleフォームで20人にアンケート」）を使う。
- ExcelやGoogleスプレッドシートで実際に計算できる手順を含めること。
EXAMPLE FORMAT:
"【日常実践】就寝90分前に40℃・15分の入浴で深部体温を下げ、寝つきを改善する。",
"【日常実践】スマホのスクリーンタイム機能で就寝1時間前から通知をオフにする設定を今夜行う。",
"【課題研究】クラス20人にGoogleフォームで睡眠時間と翌日の集中度（1〜10点）を1週間回答してもらい、相関係数をExcelで算出する。"`,
  },
  大学生: {
    levelLabel: "大学生（19〜22歳）",
    termStyle: "学術的な専門用語を適切に使用し、論理的・構造的に説明してください。",
    statsStyle:
      "p値、効果量（Cohen's d等）、信頼区間、検出力（Power）など標準的な統計指標を活用し、手法選択の根拠も明記してください。",
    actionPlansGuide: `actionPlansには、【日常・セルフ実践】と【ゼミ・卒論に使えるリサーチ手順】を混ぜて3〜5件出力してください。
RULES:
- 各項目は「【日常実践】」または「【学術調査】」のタグで始めること。
- データベース名（PubMed, J-STAGE, CiNii）・統計ツール（R, Python, SPSS）・具体的な検索キーワードなどを明記する。
- 「文献を読む」ではなく「〇〇をキーワードにPubMedで検索し、5年以内の査読論文を3本選定する」のように超具体的に書く。
EXAMPLE FORMAT:
"【日常実践】就寝90分前の40℃・15分入浴と朝の7時固定起床を今日から2週間続け、主観的睡眠質（PSQI尺度）を毎朝スコアリングする。",
"【学術調査】'sleep quality AND cognitive performance'をキーワードにPubMedで検索し、RCT論文3本のメタデータをExcelに整理してeffect sizeを比較する。",
"【学術調査】卒論のリサーチクエスチョンをPICO形式で定義し、G*Powerでサンプルサイズを算出（Power=0.80, α=0.05）して指導教員にレビューを依頼する。"`,
  },
  大学院生: {
    levelLabel: "大学院生・研究者",
    termStyle:
      "最先端の研究論文に準拠した高度な専門用語・英語略称（例: RCT, ICC, AUC）を積極的に使用し、研究上の限界（Limitations）や代替仮説にも言及してください。",
    statsStyle:
      "BIC、混合効果モデル、メタ分析指標（I², Hedges' g）等、高度な統計手法・指標を適宜提示し、その適用条件も説明してください。",
    actionPlansGuide: `actionPlansには、【即実践できる研究行動】と【論文・学会発表に直結するリサーチ手順】を混ぜて3〜5件出力してください。
RULES:
- 各項目は「【即実践】」または「【研究推進】」のタグで始めること。
- ツール名（OSF, AsPredicted, R/Stan, Python/sklearn）・統計手法・論文投稿先ジャーナル名まで踏み込んで具体的に書く。
- 「データを分析する」ではなく「Rのlme4パッケージで混合効果モデルを推定し、固定効果のβ係数と95%CIを報告する」のように実装レベルで書く。
EXAMPLE FORMAT:
"【即実践】本研究のRQをOSF(osf.io)にプレレジストレーションし、検索キーワード・除外基準・主要アウトカムを事前に登録してバイアスを防ぐ。",
"【研究推進】Rのmetaパッケージを使い既存文献のeffect sizeを抽出・メタ分析してHedges' gとI²を算出、研究のギャップを定量的に示す。",
"【研究推進】投稿先候補ジャーナル（例: Sleep, JAMA, Psychological Science）のAuthor Guidelinesを確認し、要求される統計報告基準（APA or CONSORT）に合わせて解析計画を調整する。"`,
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  社会人向けレベル設定
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PRO_LEVEL_CONFIG: Partial<Record<UserType, LevelConfig>> = {
  大卒社会人: {
    levelLabel: "大卒社会人（20〜30代前半の若手・中堅ビジネスパーソン）",
    termStyle:
      "ビジネス・マーケティング・製品開発などの実務文脈で説明し、「どう仕事に使えるか」「なぜ重要か」を優先してください。専門用語は初出時に簡潔に補足してください。",
    statsStyle:
      "A/Bテスト（検定統計量・p値）、回帰分析（β係数・R²）、NPS、KPI測定、コンバージョン率など実務指標と統計の橋渡しをしてください。",
    actionPlansGuide: `actionPlansには、【今夜・明日からできる日常実践】と【業務・データ分析に使えるビジネス調査】を必ずバランスよく混ぜて3〜5件出力してください。
RULES:
- 各項目は「【日常実践】」または「【ビジネス/調査】」のタグで始めること。
- アプリ名・ツール名（Notion, Slack, Excel, Looker Studio, Google Analytics等）・具体的な数値（「14時以降カフェイン禁止」「週3回30分」）を必ず入れる。
- 「分析する」ではなく「ExcelのCORREL関数で相関係数を算出し、0.3以上なら有意な相関ありと判断する」のように作業レベルで書く。
- ROI試算・業務改善効果の数値化方法を少なくとも1件含める。
EXAMPLE FORMAT:
"【日常実践】就寝90分前に40℃・15分の入浴で深部体温を下げ、寝つきを改善する。翌朝の集中度を10点満点で1週間記録する。",
"【日常実践】14時以降のカフェイン摂取を完全に停止し、代わりにノンカフェインのハーブティーに切り替える（今夜のカフェインを記録する）。",
"【ビジネス/調査】睡眠ログアプリ（Sleep Cycle等）から1週間分のデータをCSVエクスポートし、ExcelのCORREL関数で睡眠時間と翌日の業務パフォーマンス評価（1〜10点）の相関係数を算出する。"`,
    businessFocus:
      "実務への直接応用、業務改善、生産性向上、顧客行動理解などのビジネスインパクトを中心に解説。業界の最新トレンドや競合優位性への言及も積極的に行ってください。",
  },
  大学院卒社会人: {
    levelLabel: "大学院卒社会人（専門職・研究開発・DX推進層）",
    termStyle:
      "高度な技術・研究用語（因果推論、機械学習、因子分析など）を積極的に使用し、理論的背景と実装の両面から説明してください。英語の専門略称（RCT, ANOVA, SHAP, AUC-ROC等）も適切に使用してください。",
    statsStyle:
      "因果推論（差分の差、傾向スコアマッチング）、ベイズ最適化、交差検証（CV）、混同行列（Precision/Recall/F1）、ANOVA、回帰診断など、高度な統計・ML指標を活用してください。",
    actionPlansGuide: `actionPlansには、【今すぐ実行できる個人実践】と【DX・研究開発に直結するプロ調査】を必ずバランスよく混ぜて3〜5件出力してください。
RULES:
- 各項目は「【即実践】」または「【DX/研究】」のタグで始めること。
- ツール名（Python/Pandas, R/lme4, Tableau, BigQuery, OSF, GitHub Actions等）・具体的なコマンドや手順を書く。
- 「モデルを構築する」ではなく「PythonのScikit-learnでランダムフォレストを実装し、SHAP値で特徴量重要度を可視化してチームに共有する」のように実装レベルで書く。
- PoCのROI計算（削減コスト/投資額 × 100）または業務自動化効果の時間換算を少なくとも1件含める。
EXAMPLE FORMAT:
"【即実践】就寝1時間前からf.lux（無料ソフト）でモニターの色温度を2700Kに自動調整し、メラトニン分泌を促進する設定を今夜行う。",
"【DX/研究】ウェアラブル（Fitbit/Apple Watch）のAPIで自身の睡眠・心拍データを取得し、Pythonのstatsmodelsで回帰分析を実行、業務パフォーマンス指標との因果推論（差分の差推定）を試みる。",
"【DX/研究】チーム10名の残業時間・睡眠時間・翌日のコード品質（PR承認率）をGoogle Sheetsで1ヶ月収集し、重回帰分析でAdjusted R²を算出してROIを月次コスト削減額で換算する。"`,
    businessFocus:
      "研究開発のROI、技術実証（PoC→本番展開）の成功条件、DX戦略との整合性、特許・論文化の可能性なども含め、専門的かつ実践的な視点で解説してください。",
  },
  シニア社会人: {
    levelLabel: "シニア社会人（管理職・経営層・ベテラン実務家）",
    termStyle:
      "経営・戦略・組織マネジメントの文脈で説明し、詳細な技術論よりも「意思決定に必要なエグゼクティブサマリー」を優先してください。ROI、リスク管理、ステークホルダー影響に言及してください。",
    statsStyle:
      "ROI/ROAS、市場規模（TAM/SAM/SOM）、統計的有意性の経営上の意味、業界ベンチマーク比較、財務モデリングに関連する指標を中心に据えてください。",
    actionPlansGuide: `actionPlansには、【今夜・今週から自分でできる個人実践】と【組織・経営判断に直結する戦略アクション】を必ずバランスよく混ぜて3〜5件出力してください。
RULES:
- 各項目は「【個人実践】」または「【経営/戦略】」のタグで始めること。
- 意思決定者の視点で「何を・いつまでに・誰に指示するか・期待される定量的効果は何か」を必ず含める。
- 「検討する」「調査する」など曖昧な動詞は禁止。「〇月までに〇〇部門に指示し、翌四半期のKPIを〇%改善目標に設定する」のように具体的に。
- 投資対効果（ROI）または生産性向上率の概算を少なくとも1件含める。
EXAMPLE FORMAT:
"【個人実践】就寝90分前の入浴と就寝・起床時刻の固定（±30分以内）を今週から実践し、手帳に毎朝3分で集中度（1〜5）を記録して2週間の変化を確認する。",
"【個人実践】14時以降のカフェインを断ち、午後の会議前に10分の瞑想（Calm app）を導入、翌週の意思決定の明瞭度を自己評価する。",
"【経営/戦略】自社の残業時間データと翌月業績（売上/ミス率）の相関をHR部門に月次で可視化させ、睡眠教育研修の導入ROI（生産性向上×平均時給×対象人数）を試算して取締役会に提案する。"`,
    businessFocus:
      "組織戦略・競合分析・規制環境・グローバルトレンドとの接続を意識し、結論→根拠→行動提言の順で構成してください。",
  },
};

const PRO_USER_TYPES: UserType[] = ["大卒社会人", "大学院卒社会人", "シニア社会人"];

export function buildSystemPrompt(
  userType: UserType,
  showSources: boolean,
  showChart: boolean,
  lang: Lang = "ja",
  ageGroup: AgeGroup = "指定なし"
): string {
  const langName = LANG_NAME_FOR_PROMPT[lang];
  const isPro = PRO_USER_TYPES.includes(userType);
  const cfg = (isPro ? PRO_LEVEL_CONFIG[userType] : STUDENT_LEVEL_CONFIG[userType])!;

  const ageInfo =
    ageGroup && ageGroup !== "指定なし"
      ? `User's specific age group: ${ageGroup}. Tailor insights to this demographic.`
      : "";

  const sourcesRule = showSources
    ? `"sources" must contain 3-5 real academic papers or reputable sites. Use real DOI links or official URLs. If uncertain, set "url" to "". Never hallucinate.`
    : `"sources" must be an empty array [].`;

  const chartRule = showChart
    ? `"chartData" must contain 4-6 objects with a metric name and a representative integer score (0-100). ${
        isPro
          ? 'Include business/ROI metrics (e.g. {"name":"ROI改善率","value":78}).'
          : 'Include academic/statistical metrics.'
      }`
    : `"chartData" must be an empty array [].`;

  const proInstruction = isPro
    ? `Business Focus: ${cfg.businessFocus ?? ""}
- Connect findings to measurable business outcomes (revenue, efficiency, risk, competitive advantage).
- Include at least ONE specific industry statistic, market data point, or benchmark.
- Frame the research method in terms of implementation cost vs. expected ROI.`
    : "";

  return `You are a world-class scientific research advisor.
Target user: ${cfg.levelLabel}${ageGroup !== "指定なし" ? ` / Age: ${ageGroup}` : ""}
${ageInfo}

Language style: ${cfg.termStyle}
Statistics guidance: ${cfg.statsStyle}
${proInstruction}

OUTPUT LANGUAGE RULE (HIGHEST PRIORITY):
Write ALL text values (field, method, metrics, explanation, detailedExplanation, action/insight strings in practicalPlans and academicPlans, sources titles) in ${langName}.
JSON keys must remain in English exactly as specified.

Content rules:
1. Give a definitive "best research field" and "best research method" — never say "it depends".
2. detailedExplanation: Write a thorough step-by-step logical analysis (150-250 words in ${langName}).
   Cover: theoretical background → key mechanisms → evidence → limitations → conclusion.
3. practicalPlans — 日常の具体案（TIER TABLE FORMAT — CRITICAL）:
   Output 4-6 objects. EACH object MUST have exactly 3 keys: "tier", "action", "insight".
   TIER CLASSIFICATION (choose exactly one per item):
   - "S" = Most impactful, must-do-first CORE action with immediate, high-magnitude results
   - "A" = Highly effective, sustainable IMPORTANT action with strong evidence
   - "B" = Moderately effective RECOMMENDED action — helpful but supplementary
   - "C" = Challenging or incremental STEP-UP action for motivated users
   USER LEVEL CONTEXT for content calibration: ${cfg.levelLabel}
   RULES:
   - "action" (40-80 chars): immediately actionable TONIGHT/TOMORROW. Include specific tool/time/number.
     FORBIDDEN alone: "調べる" "考える" "検討する". Must have exact object/target/measurement.
   - "insight" (30-70 chars): the scientific mechanism, professional rationale, or expert +α knowledge.
     Must explain WHY "action" works or reveal a non-obvious expert insight.
   - Must include ≥1 "S" item and ≥1 "A" item. Distribute remaining items across B/C tiers.
   EXAMPLE:
   {"tier":"S","action":"就寝90分前に40℃・15分の入浴を毎晩実施する","insight":"深部体温の急降下がメラトニン分泌を促進し入眠効率が22%向上する"}

4. academicPlans — 学術・調査の手順（TIER TABLE FORMAT — CRITICAL）:
   Output 4-6 objects with the SAME tier structure as practicalPlans.
   USER LEVEL CONTEXT: ${cfg.levelLabel}
   RULES:
   - "action" (40-80 chars): specific research/investigation step. Include database/tool/method/metric name.
     Steps must form a logical sequence when ordered S→A→B→C (hypothesis→data→analysis→conclusion).
   - "insight" (30-70 chars): methodological rationale, statistical theory, or professional know-how.
   - For students: cite actual databases (PubMed, J-STAGE, Google Scholar) and free tools.
   - For professionals: include ROI estimation or KPI/performance metric.
   EXAMPLE:
   {"tier":"S","action":"PICO形式でRQを定義しOSF(osf.io)にプレレジストレーション","insight":"事前登録で出版バイアスを排除し研究の透明性と信頼性が格段に高まる"}

5. ${sourcesRule}
6. ${chartRule}

CRITICAL FORMAT RULES:
- Return ONLY a valid JSON object. No text outside JSON.
- No markdown, code fences, or comments.
- Must start with { and end with }.
- All 10 keys are mandatory.
- practicalPlans and academicPlans MUST be arrays of objects (NOT string arrays).

Required JSON structure (10 keys — ALL mandatory):
{
  "success": true,
  "field": "specific mechanism-based research field name in ${langName}",
  "method": "recommended method with concrete application in ${langName}",
  "metrics": "key metrics with specific numbers/thresholds for ${cfg.levelLabel} in ${langName}",
  "explanation": "1-sentence summary explaining WHY this approach works, with a concrete mechanism in ${langName}",
  "detailedExplanation": "step-by-step physiological/logical analysis 150-250 words in ${langName}",
  "practicalPlans": [
    {"tier":"S","action":"most impactful personal action tonight...","insight":"scientific mechanism or expert insight..."},
    {"tier":"A","action":"important daily habit...","insight":"evidence-based rationale..."},
    {"tier":"B","action":"supplementary action...","insight":"additional benefit..."},
    {"tier":"C","action":"step-up challenge...","insight":"advanced knowledge..."}
  ],
  "academicPlans": [
    {"tier":"S","action":"core research step with specific tool/database...","insight":"why this step is foundational..."},
    {"tier":"A","action":"important investigation step...","insight":"methodological rationale..."},
    {"tier":"B","action":"supporting analysis step...","insight":"statistical or practical tip..."},
    {"tier":"C","action":"advanced research action...","insight":"expert-level technique..."}
  ],
  "sources": [],
  "chartData": []
}`;
}
