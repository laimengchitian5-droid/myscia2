// ============================================================
//  SciaSource — 多言語翻訳定義 (ja / en / zh / ko)
// ============================================================

export type Lang = "ja" | "en" | "zh" | "ko";

export interface Translations {
  // App
  appDesc: string;
  // Sidebar
  newChat: string;
  historyTitle: string;
  noHistoryLabel: string;
  trashLabel: string;
  trashEmptyLabel: string;
  deleteHistoryLabel: string;
  restoreLabel: string;
  deleteForeverLabel: string;
  settingsLabel: string;
  helpLabel: string;
  languageLabel: string;
  // Input panel
  inputLabel: string;
  inputPlaceholder: string;
  analyzeBtn: string;
  analyzing: string;
  resetBtn: string;
  exampleLabel: string;
  ctrlEnter: string;
  charLimit: string;
  // Options
  userTypeLabel: string;
  studentGroupLabel: string;
  professionalGroupLabel: string;
  userTypes: [string, string, string, string]; // 中学生〜大学院生（学生4種）
  proUserTypes: [string, string, string];      // 社会人3種
  ageGroupLabel: string;
  ageGroupOptions: string[];
  showSourcesLabel: string;
  showSourcesDesc: string;
  showChartLabel: string;
  showChartDesc: string;
  // Results
  fieldLabel: string;
  methodLabel: string;
  metricsLabel: string;
  overviewLabel: string;
  explanationLabel: string;
  detailedLabel: string;
  actionPlansLabel: string;
  practicalPlansLabel: string;
  academicPlansLabel: string;
  sourcesLabel: string;
  chartTitle: string;
  chartTypes: { bar: string; line: string; area: string; pie: string; radar: string; composed: string };
  providerLabel: string;
  demoWarningTitle: string;
  demoWarningDesc: string;
  // Empty / Loading states
  emptyTitle: string;
  emptyDesc: string;
  loadingTitle: string;
  loadingDesc: string;
  // Examples
  exampleQuestions: string[];
}

const ja: Translations = {
  appDesc: "科学的リサーチ判定",
  newChat: "新しく判定する",
  historyTitle: "過去の履歴",
  noHistoryLabel: "履歴がありません",
  trashLabel: "ゴミ箱",
  trashEmptyLabel: "ゴミ箱は空です",
  deleteHistoryLabel: "履歴を削除",
  restoreLabel: "復元",
  deleteForeverLabel: "完全に削除",
  settingsLabel: "設定",
  helpLabel: "ヘルプ",
  languageLabel: "言語",
  inputLabel: "科学的疑問を入力",
  inputPlaceholder: "例: 睡眠不足は記憶力にどう影響するの？",
  analyzeBtn: "解析する",
  analyzing: "解析中...",
  resetBtn: "リセット",
  exampleLabel: "質問の例",
  ctrlEnter: "Ctrl+Enter で送信",
  charLimit: "文字",
  userTypeLabel: "あなたの属性",
  studentGroupLabel: "学生",
  professionalGroupLabel: "社会人",
  userTypes: ["中学生", "高校生", "大学生", "大学院生"],
  proUserTypes: ["大卒社会人", "大学院卒社会人", "シニア社会人"],
  ageGroupLabel: "年齢層（任意）",
  ageGroupOptions: ["指定なし", "15〜19歳", "20〜24歳", "25〜29歳", "30〜34歳", "35〜39歳", "40〜44歳", "45〜49歳", "50代", "60代以上"],
  showSourcesLabel: "引用元を表示",
  showSourcesDesc: "論文・学術ソースを提示",
  showChartLabel: "統計グラフを表示",
  showChartDesc: "指標チャートを生成",
  fieldLabel: "最適な研究分野",
  methodLabel: "推奨する研究手法",
  metricsLabel: "統計指標",
  overviewLabel: "科学的概要",
  explanationLabel: "概要解説",
  detailedLabel: "詳細な分析",
  actionPlansLabel: "今すぐできる実用案",
  practicalPlansLabel: "💡 日常の具体案",
  academicPlansLabel: "🔬 研究・調査の手順",
  sourcesLabel: "参考文献・引用元",
  chartTitle: "統計指標チャート",
  chartTypes: { bar: "棒グラフ", line: "折れ線", area: "エリア", pie: "円グラフ", radar: "レーダー", composed: "複合" },
  providerLabel: "モデル",
  demoWarningTitle: "デモデータ表示中",
  demoWarningDesc: ".env.local に GROQ_API_KEY を設定してください",
  emptyTitle: "疑問を入力して解析を開始",
  emptyDesc: "左側のパネルに研究したいテーマを入力してください",
  loadingTitle: "AIが解析中...",
  loadingDesc: "Groq LLM が最適な研究アプローチを判定しています",
  exampleQuestions: [
    "毎日運動すると本当に記憶力が上がるの？",
    "SNSの使いすぎはうつ病のリスクを高めるか？",
    "睡眠不足はどれくらい学習効率に影響するか？",
    "プラシーボ効果はなぜ起きるのか？",
  ],
};

const en: Translations = {
  appDesc: "Scientific Research Advisor",
  newChat: "New Analysis",
  historyTitle: "History",
  noHistoryLabel: "No history",
  trashLabel: "Trash",
  trashEmptyLabel: "Trash is empty",
  deleteHistoryLabel: "Delete",
  restoreLabel: "Restore",
  deleteForeverLabel: "Delete forever",
  settingsLabel: "Settings",
  helpLabel: "Help",
  languageLabel: "Language",
  inputLabel: "Enter your scientific question",
  inputPlaceholder: "e.g. Does daily exercise really improve memory?",
  analyzeBtn: "Analyze",
  analyzing: "Analyzing...",
  resetBtn: "Reset",
  exampleLabel: "Example questions",
  ctrlEnter: "Ctrl+Enter to submit",
  charLimit: "chars",
  userTypeLabel: "Your level",
  studentGroupLabel: "Student",
  professionalGroupLabel: "Professional",
  userTypes: ["Middle School", "High School", "Undergraduate", "Graduate"],
  proUserTypes: ["Graduate Professional", "Research Professional", "Senior Professional"],
  ageGroupLabel: "Age group (optional)",
  ageGroupOptions: ["Any", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50s", "60+"],
  showSourcesLabel: "Show sources",
  showSourcesDesc: "Cite academic papers",
  showChartLabel: "Show chart",
  showChartDesc: "Generate statistics chart",
  fieldLabel: "Best research field",
  methodLabel: "Recommended method",
  metricsLabel: "Statistical metrics",
  overviewLabel: "Scientific overview",
  explanationLabel: "Overview",
  detailedLabel: "Detailed analysis",
  actionPlansLabel: "Action plans",
  practicalPlansLabel: "💡 Daily actions",
  academicPlansLabel: "🔬 Research steps",
  sourcesLabel: "References",
  chartTitle: "Statistics Chart",
  chartTypes: { bar: "Bar", line: "Line", area: "Area", pie: "Pie", radar: "Radar", composed: "Composed" },
  providerLabel: "Model",
  demoWarningTitle: "Demo data displayed",
  demoWarningDesc: "Set GROQ_API_KEY in .env.local to enable AI responses",
  emptyTitle: "Enter a question to start",
  emptyDesc: "Type your research topic in the left panel",
  loadingTitle: "AI is analyzing...",
  loadingDesc: "Groq LLM is determining the best research approach",
  exampleQuestions: [
    "Does daily exercise improve memory?",
    "Does excessive social media increase depression risk?",
    "How does sleep deprivation affect learning efficiency?",
    "Why does the placebo effect occur?",
  ],
};

const zh: Translations = {
  appDesc: "科学研究方法判断工具",
  newChat: "新建分析",
  historyTitle: "历史记录",
  noHistoryLabel: "暂无历史记录",
  trashLabel: "回收站",
  trashEmptyLabel: "回收站为空",
  deleteHistoryLabel: "删除",
  restoreLabel: "恢复",
  deleteForeverLabel: "永久删除",
  settingsLabel: "设置",
  helpLabel: "帮助",
  languageLabel: "语言",
  inputLabel: "输入科学问题",
  inputPlaceholder: "例如：每天运动真的能提高记忆力吗？",
  analyzeBtn: "分析",
  analyzing: "分析中...",
  resetBtn: "重置",
  exampleLabel: "示例问题",
  ctrlEnter: "Ctrl+Enter 提交",
  charLimit: "字",
  userTypeLabel: "您的身份",
  studentGroupLabel: "学生",
  professionalGroupLabel: "职场人士",
  userTypes: ["初中生", "高中生", "大学生", "研究生"],
  proUserTypes: ["职场人士", "专业研究人员", "资深从业者"],
  ageGroupLabel: "年龄段（可选）",
  ageGroupOptions: ["不限", "15-19岁", "20-24岁", "25-29岁", "30-34岁", "35-39岁", "40-44岁", "45-49岁", "50多岁", "60岁以上"],
  showSourcesLabel: "显示引用来源",
  showSourcesDesc: "引用学术论文",
  showChartLabel: "显示统计图表",
  showChartDesc: "生成指标图表",
  fieldLabel: "最佳研究领域",
  methodLabel: "推荐研究方法",
  metricsLabel: "统计指标",
  overviewLabel: "科学概述",
  explanationLabel: "概要",
  detailedLabel: "详细分析",
  actionPlansLabel: "立即可行的方案",
  practicalPlansLabel: "💡 日常实践方案",
  academicPlansLabel: "🔬 研究调查步骤",
  sourcesLabel: "参考文献",
  chartTitle: "统计指标图表",
  chartTypes: { bar: "柱状图", line: "折线图", area: "面积图", pie: "饼图", radar: "雷达图", composed: "复合图" },
  providerLabel: "模型",
  demoWarningTitle: "显示示例数据",
  demoWarningDesc: "请在 .env.local 中设置 GROQ_API_KEY",
  emptyTitle: "输入问题开始分析",
  emptyDesc: "在左侧面板输入您想研究的主题",
  loadingTitle: "AI 分析中...",
  loadingDesc: "Groq LLM 正在判断最佳研究方法",
  exampleQuestions: [
    "每天运动真的能提高记忆力吗？",
    "过度使用社交媒体会增加抑郁风险吗？",
    "睡眠不足对学习效率有多大影响？",
    "为什么会产生安慰剂效应？",
  ],
};

const ko: Translations = {
  appDesc: "과학적 리서치 판정 도구",
  newChat: "새 분석",
  historyTitle: "과거 기록",
  noHistoryLabel: "기록 없음",
  trashLabel: "휴지통",
  trashEmptyLabel: "휴지통이 비어 있습니다",
  deleteHistoryLabel: "삭제",
  restoreLabel: "복원",
  deleteForeverLabel: "영구 삭제",
  settingsLabel: "설정",
  helpLabel: "도움말",
  languageLabel: "언어",
  inputLabel: "과학적 질문 입력",
  inputPlaceholder: "예: 매일 운동하면 정말 기억력이 좋아질까?",
  analyzeBtn: "분석",
  analyzing: "분석 중...",
  resetBtn: "초기화",
  exampleLabel: "예시 질문",
  ctrlEnter: "Ctrl+Enter로 제출",
  charLimit: "자",
  userTypeLabel: "신분",
  studentGroupLabel: "학생",
  professionalGroupLabel: "직장인",
  userTypes: ["중학생", "고등학생", "대학생", "대학원생"],
  proUserTypes: ["직장인", "전문연구직", "시니어 전문가"],
  ageGroupLabel: "연령대 (선택)",
  ageGroupOptions: ["제한 없음", "15-19세", "20-24세", "25-29세", "30-34세", "35-39세", "40-44세", "45-49세", "50대", "60대 이상"],
  showSourcesLabel: "인용 출처 표시",
  showSourcesDesc: "학술 논문 인용",
  showChartLabel: "통계 차트 표시",
  showChartDesc: "지표 차트 생성",
  fieldLabel: "최적 연구 분야",
  methodLabel: "추천 연구 방법",
  metricsLabel: "통계 지표",
  overviewLabel: "과학적 개요",
  explanationLabel: "개요",
  detailedLabel: "상세 분석",
  actionPlansLabel: "즉시 실행 가능한 방안",
  practicalPlansLabel: "💡 일상 실천 방안",
  academicPlansLabel: "🔬 연구·조사 절차",
  sourcesLabel: "참고 문헌",
  chartTitle: "통계 지표 차트",
  chartTypes: { bar: "막대", line: "꺾은선", area: "영역", pie: "원형", radar: "레이더", composed: "복합" },
  providerLabel: "모델",
  demoWarningTitle: "데모 데이터 표시 중",
  demoWarningDesc: ".env.local에 GROQ_API_KEY를 설정하세요",
  emptyTitle: "질문을 입력하여 분석 시작",
  emptyDesc: "왼쪽 패널에 연구하고 싶은 주제를 입력하세요",
  loadingTitle: "AI 분석 중...",
  loadingDesc: "Groq LLM이 최적의 연구 방법을 판단하고 있습니다",
  exampleQuestions: [
    "매일 운동하면 정말 기억력이 좋아질까?",
    "SNS 과다 사용은 우울증 위험을 높이나?",
    "수면 부족은 학습 효율에 얼마나 영향을 미치나?",
    "플라시보 효과는 왜 나타나는가?",
  ],
};

export const LANG_LABELS: Record<Lang, string> = {
  ja: "🇯🇵 日本語",
  en: "🇺🇸 English",
  zh: "🇨🇳 中文",
  ko: "🇰🇷 한국어",
};

export const LANG_NAME_FOR_PROMPT: Record<Lang, string> = {
  ja: "Japanese (日本語)",
  en: "English",
  zh: "Chinese (中文)",
  ko: "Korean (한국어)",
};

export const TRANSLATIONS: Record<Lang, Translations> = { ja, en, zh, ko };
