// ============================================================
//  SciaSource — /app/api/predict/route.ts
//  科学的リサーチ・アプローチ判定 コアAPIエンドポイント
// ============================================================

// 【システム要件】Vercel本番環境での静的キャッシュを完全排除
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { LLMManager } from "@/app/lib/llm/LLMManager";
import { buildSystemPrompt } from "@/app/lib/prompts/buildSystemPrompt";
import {
  PredictRequestSchema,
  LLMJsonResponseSchema,
} from "@/app/lib/validation/schemas";
import type { PredictResponse, LLMProvider, ChartDataPoint, SourceItem, ResearchDepth, Plan } from "@/app/types";
import { resolveGroqApiKey } from "@/app/lib/llm/GroqProvider";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  フォールバック用デモデータ
//  APIキー未設定・レートリミット・通信失敗時に返す安全なデータ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildFallbackResponse(
  errorMessage: string,
  showSources: boolean,
  showChart: boolean,
  provider: LLMProvider,
  model: string
): PredictResponse {
  const sources: SourceItem[] = showSources
    ? [
        {
          title: "PubMed Central — 生物医学・生命科学論文データベース",
          url: "https://www.ncbi.nlm.nih.gov/pmc/",
        },
        {
          title: "Google Scholar — 学術論文検索",
          url: "https://scholar.google.com/",
        },
        {
          title: "J-STAGE — 日本語学術論文プラットフォーム",
          url: "https://www.jstage.jst.go.jp/",
        },
      ]
    : [];

  const chartData: ChartDataPoint[] = showChart
    ? [
        { name: "効果量 (d)", value: 72 },
        { name: "統計的検出力", value: 80 },
        { name: "信頼区間幅", value: 65 },
        { name: "サンプル適切性", value: 88 },
        { name: "再現性スコア", value: 60 },
      ]
    : [];

  return {
    success: false,
    isFallback: true,
    errorMessage,
    field: "🎯 [デモ] 認知科学・行動心理学",
    method:
      "🔬 [デモ] ランダム化比較試験（RCT）— 対照群と介入群を無作為に割り付け、因果関係を検証する最も信頼性の高い実験手法",
    metrics:
      "📊 [デモ] p値（< 0.05）、Cohen's d（効果量）、95%信頼区間、統計的検出力（Power ≥ 0.80）",
    explanation:
      "※ APIキーが未設定またはAI接続に失敗したため、デモデータを表示しています。" +
      ".env.local に GROQ_API_KEY を設定するか、Groq Console（console.groq.com）で無料キーを取得してください。",
    detailedExplanation:
      "[デモ] ランダム化比較試験（RCT）は、参加者を無作為に「介入群」と「対照群」に割り付け、" +
      "介入の効果を公正に検証する最も信頼性の高い研究デザインです。" +
      "バイアスを排除するため二重盲検法を用いることが多く、" +
      "統計的有意性はp値（< 0.05）と効果量（Cohen's d）で評価します。",
    practicalPlans: [
      { tier: "S", action: "就寝90分前に40℃・15分の入浴を毎晩実施する", insight: "深部体温の急降下がメラトニン分泌を促進し入眠効率が22%向上する" },
      { tier: "A", action: "14時以降のカフェインを完全停止しルイボスティーへ切り替える", insight: "カフェインの半減期は約6時間で、14時以降の摂取が深睡眠を大幅に阻害する" },
      { tier: "B", action: "就寝1時間前にスマホをリビングの充電スタンドへ置く習慣をつける", insight: "ブルーライトよりも「スクロール行動の覚醒維持効果」の方が睡眠阻害の主因である" },
      { tier: "C", action: "10〜20分の昼寝（パワーナップ）を13〜15時の間に取り入れる", insight: "30分を超える昼寝は深睡眠に入り夜間睡眠質を低下させるため時間厳守が必要" },
    ],
    academicPlans: [
      { tier: "S", action: "研究疑問をPICO形式で定義しOSF(osf.io)にプレレジストレーション", insight: "事前登録で出版バイアスを排除し研究の透明性と再現性が格段に高まる" },
      { tier: "A", action: "PubMedで'sleep quality AND cognitive performance'を検索しRCT論文3本のeffect sizeを比較", insight: "系統的レビューの質はPRISMAガイドラインに準拠しているかで評価される" },
      { tier: "B", action: "G*Powerでサンプルサイズを算出（Power=0.80、α=0.05）しデータ収集計画を立案", insight: "検出力0.80未満の研究は偽陰性リスクが高く学術誌で却下される可能性が高い" },
      { tier: "C", action: "Rのlme4パッケージで混合効果モデルを推定し個人差（ランダム効果）を制御", insight: "固定効果と変量効果を分離することで個体差バイアスを統計的に除去できる" },
    ],
    sources,
    chartData,
    provider,
    model,
    latencyMs: 0,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  POST ハンドラー
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function POST(req: NextRequest): Promise<NextResponse<PredictResponse>> {
  // ---------- 1. リクエストボディのパース ----------
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      buildFallbackResponse("リクエストのJSONパースに失敗しました", false, false, "groq", "llama-3.3-70b-versatile"),
      { status: 400 }
    );
  }

  // ---------- 2. Zodバリデーション ----------
  const parsed = PredictRequestSchema.safeParse(body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(" / ");
    return NextResponse.json(
      buildFallbackResponse(`バリデーションエラー: ${errorMsg}`, false, false, "groq", "llama-3.3-70b-versatile"),
      { status: 422 }
    );
  }

  const { question, userType, ageGroup, showSources, showChart, provider, lang, researchDepth, plan } = parsed.data;

  // ---------- 3. APIキー確認 ----------
  const apiKey = resolveGroqApiKey();
  if (!apiKey || apiKey.length < 10) {
    return NextResponse.json(
      buildFallbackResponse(
        "GROQ_API_KEY が設定されていません。.env.local を確認してください。",
        showSources,
        showChart,
        provider as LLMProvider,
        "llama-3.3-70b-versatile"
      ),
      { status: 200 } // フロントをクラッシュさせないため200を返す
    );
  }

  // ---------- 4. LLMManager 初期化（ファクトリーパターン） ----------
  const manager = new LLMManager(provider as LLMProvider);

  // ---------- 5. システムプロンプト構築（動的・ユーザー属性対応） ----------
  const systemPrompt = buildSystemPrompt(userType, showSources, showChart, lang, ageGroup, researchDepth, plan);

  const userMessage =
    `以下の疑問・質問に対して、科学的リサーチアプローチの観点から最適な研究分野と研究手法を答えてください。\n\n` +
    `【質問】${question}\n\n` +
    `必ずJSONのみを返してください。マークダウンや説明文を含めないでください。`;

  // ---------- 6. LLM呼び出し（Try-Catch + フォールバック） ----------
  try {
    const output = await manager.complete({ systemPrompt, userMessage });

    // ---------- 7. LLMレスポンスのZod検証 ----------
    const validated = LLMJsonResponseSchema.safeParse(output.parsed);

    if (!validated.success) {
      // 全Zodエラーを結合してデバッグしやすくする
      const zodErrors = validated.error.issues
        .map((i) => `[${i.path.join(".")}] ${i.message}`)
        .join(" | ");
      console.error("[SciaSource] Zod validation failed:", zodErrors);
      console.error("[SciaSource] LLM raw parsed object:", JSON.stringify(output.parsed));
      return NextResponse.json(
        buildFallbackResponse(
          `LLMレスポンスの構造が不正です: ${zodErrors}`,
          showSources,
          showChart,
          manager.activeProvider,
          manager.activeModel
        ),
        { status: 200 }
      );
    }

    // ---------- 8. showSources/showChart フラグに基づく後処理 ----------
    const finalSources: SourceItem[] = showSources ? validated.data.sources : [];
    const finalChartData: ChartDataPoint[] = showChart ? validated.data.chartData : [];

    // ---------- 9. 成功レスポンス返却 ----------
    const response: PredictResponse = {
      ...validated.data,
      sources: finalSources,
      chartData: finalChartData,
      provider: manager.activeProvider,
      model: manager.activeModel,
      latencyMs: output.latencyMs,
      isFallback: false,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: unknown) {
    // ---------- 10. 堅牢なエラーハンドリング ----------
    let errorMessage = "不明なエラーが発生しました";

    if (error instanceof Error) {
      // レートリミット検出
      if (error.message.includes("429") || error.message.toLowerCase().includes("rate limit")) {
        errorMessage = "レートリミットに達しました。しばらく待ってから再試行してください。";
      } else if (error.message.includes("401") || error.message.toLowerCase().includes("unauthorized")) {
        errorMessage = "APIキーが無効です。正しいGroq APIキーを設定してください。";
      } else if (error.message.includes("503") || error.message.toLowerCase().includes("unavailable")) {
        errorMessage = "Groqサービスが一時的に利用不可です。しばらくお待ちください。";
      } else {
        errorMessage = error.message;
      }
    }

    // 500エラーでクラッシュさせず、フォールバックデータと success:false を返す
    return NextResponse.json(
      buildFallbackResponse(
        errorMessage,
        showSources,
        showChart,
        manager.activeProvider,
        manager.activeModel
      ),
      { status: 200 }
    );
  }
}
