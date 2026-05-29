"use client";

import { useState, useEffect, useCallback } from "react";
import { Header }      from "@/app/components/layout/Header";
import { Sidebar }     from "@/app/components/layout/Sidebar";
import { MessageLog }  from "@/app/components/chat/MessageLog";
import { ChatFooter }  from "@/app/components/chat/ChatFooter";
import type { PredictRequest, PredictResponse, UserType, Lang } from "@/app/types";
import type { ChatMessage, ChatThread, ThreadSettings } from "@/app/types/chat";
import type { Translations } from "@/app/lib/i18n/translations";
import { TRANSLATIONS } from "@/app/lib/i18n/translations";
import { FlaskConical, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// UserType の内部値テーブル（バックエンド用の日本語固定キー）
const INTERNAL_USER_TYPES: UserType[] = [
  "中学生", "高校生", "大学生", "大学院生",
  "大卒社会人", "大学院卒社会人", "シニア社会人",
];

const SUPPORTED_LANGS: Lang[] = ["ja", "en", "zh", "ko"];

// ── デフォルト設定 ──────────────────────────
const DEFAULT_SETTINGS: ThreadSettings = {
  userTypeIdx: 2,       // 大学生
  ageGroup:    "指定なし",
  showSources: true,
  showChart:   true,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  メインページ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function HomePage() {
  // ── テーマ / 言語 ──
  const [isDark, setIsDark] = useState(false);
  const [lang,   setLang]   = useState<Lang>("ja");

  // ── サイドバー ──
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // ── スレッド管理 ──
  const [threads,       setThreads]       = useState<ChatThread[]>([]);
  const [trashedThreads, setTrashedThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [loadingThreadId, setLoadingThreadId] = useState<string | null>(null);

  // ── グローバル設定（新規スレッド用デフォルト） ──
  const [globalSettings, setGlobalSettings] = useState<ThreadSettings>(DEFAULT_SETTINGS);

  // 翻訳（Fast Refresh 安全ガード）
  const t: Translations = TRANSLATIONS[lang] ?? TRANSLATIONS.ja;

  // 現在アクティブなスレッド
  const currentThread = threads.find((th) => th.id === activeThreadId) ?? null;
  const isLoading     = loadingThreadId !== null;

  // アクティブスレッドの設定（なければグローバル）
  const activeSettings: ThreadSettings = currentThread
    ? {
        userTypeIdx: currentThread.userTypeIdx,
        ageGroup:    currentThread.ageGroup,
        showSources: currentThread.showSources,
        showChart:   currentThread.showChart,
      }
    : globalSettings;

  // ── useEffect ──────────────────────────────
  // テーマ初期化
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
  }, []);

  // テーマ適用
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // ブラウザ言語の自動検知
  useEffect(() => {
    const browserLangs = navigator.languages ?? [navigator.language];
    for (const bl of browserLangs) {
      const code = bl.slice(0, 2) as Lang;
      if (SUPPORTED_LANGS.includes(code)) {
        setLang(code);
        break;
      }
    }
  }, []);

  // ── スレッド操作 ──────────────────────────
  const handleNewChat = useCallback(() => {
    setActiveThreadId(null);
  }, []);

  const handleSelectThread = useCallback((id: string) => {
    setActiveThreadId(id);
  }, []);

  const handleDeleteThread = useCallback((id: string) => {
    setThreads((prev) => {
      const target = prev.find((t) => t.id === id);
      if (!target) return prev;
      setTrashedThreads((tr) => [target, ...tr]);
      return prev.filter((t) => t.id !== id);
    });
    // アクティブスレッドを削除したらウェルカム画面へ
    setActiveThreadId((cur) => (cur === id ? null : cur));
  }, []);

  const handleRestoreThread = useCallback((id: string) => {
    setTrashedThreads((prev) => {
      const target = prev.find((t) => t.id === id);
      if (!target) return prev;
      setThreads((th) => [target, ...th]);
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const handleDeleteForever = useCallback((id: string) => {
    setTrashedThreads((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── 設定変更ハンドラ ──────────────────────
  const handleSettingsChange = useCallback((newSettings: ThreadSettings) => {
    setGlobalSettings(newSettings);
    if (activeThreadId) {
      setThreads((prev) =>
        prev.map((t) => t.id === activeThreadId ? { ...t, ...newSettings } : t)
      );
    }
  }, [activeThreadId]);

  // ── メッセージ送信 ────────────────────────
  const handleSendMessage = useCallback(async (
    question: string,
    settings: ThreadSettings
  ) => {
    if (!question.trim() || isLoading) return;

    // スレッドIDを確定（新規 or 既存）
    let threadId = activeThreadId;

    if (!threadId) {
      // 新規スレッド作成
      const newThread: ChatThread = {
        id:          crypto.randomUUID(),
        title:       question.length > 22 ? question.slice(0, 22) + "…" : question,
        messages:    [],
        ...settings,
        createdAt:   Date.now(),
      };
      threadId = newThread.id;
      setThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(threadId);
    } else {
      // 既存スレッドの設定を最新化
      setThreads((prev) =>
        prev.map((t) => t.id === threadId ? { ...t, ...settings } : t)
      );
    }

    // ユーザーメッセージを追加
    const userMsg: ChatMessage = {
      id:        crypto.randomUUID(),
      role:      "user",
      content:   question,
      timestamp: Date.now(),
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, userMsg] } : t
      )
    );

    setLoadingThreadId(threadId);

    try {
      const reqBody: PredictRequest = {
        question:    question.trim(),
        userType:    INTERNAL_USER_TYPES[settings.userTypeIdx],
        ageGroup:    settings.ageGroup,
        showSources: settings.showSources,
        showChart:   settings.showChart,
        lang,
      };

      const res  = await fetch("/api/predict", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(reqBody),
      });
      const json = (await res.json()) as PredictResponse;

      const assistantMsg: ChatMessage = {
        id:        crypto.randomUUID(),
        role:      "assistant",
        content:   json.explanation ?? "解析が完了しました。",
        jsonData:  json,
        timestamp: Date.now(),
      };

      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, messages: [...t.messages, assistantMsg] }
            : t
        )
      );
    } catch (err) {
      console.error("[SciaSource] API error:", err);
    } finally {
      setLoadingThreadId(null);
    }
  }, [activeThreadId, isLoading, lang]);

  // ── レンダリング ──────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">

      {/* ── サイドバー ── */}
      <Sidebar
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded((v) => !v)}
        onNewChat={handleNewChat}
        threads={threads}
        trashedThreads={trashedThreads}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onDeleteThread={handleDeleteThread}
        onRestoreThread={handleRestoreThread}
        onDeleteForever={handleDeleteForever}
        lang={lang}
        onLangChange={setLang}
        t={t}
        isDark={isDark}
      />

      {/* ── メインエリア ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ヘッダー */}
        <Header isDark={isDark} onToggleTheme={() => setIsDark((d) => !d)} t={t} />

        {/* Gemini風グラデーション帯 */}
        <div className="h-px w-full flex-none bg-gradient-to-r from-violet-500 via-fuchsia-500 via-cyan-400 to-blue-500 animate-gradient" />

        {/* ── スクロール可能なコンテンツエリア ── */}
        <main className="flex-1 overflow-y-auto">
          {!currentThread || currentThread.messages.length === 0 ? (
            /* ウェルカム画面 */
            <LandingScreen t={t} />
          ) : (
            /* チャットログ */
            <MessageLog
              thread={currentThread}
              isLoading={isLoading && loadingThreadId === activeThreadId}
              t={t}
            />
          )}
        </main>

        {/* ── チャット入力フッター（常時表示） ── */}
        <ChatFooter
          onSend={handleSendMessage}
          isLoading={isLoading}
          hasThread={!!currentThread}
          settings={activeSettings}
          onSettingsChange={handleSettingsChange}
          t={t}
        />
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ウェルカム画面（スレッド未選択 or メッセージ 0件）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LandingScreen({ t }: { t: Translations }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-full px-6 py-16 text-center"
    >
      {/* ロゴ */}
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-violet-500/25 mb-6">
        <FlaskConical className="w-10 h-10 text-white" />
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-3">
        Scia
        <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
          Source
        </span>
      </h1>

      {/* サブタイトル */}
      <p className="text-base sm:text-lg font-semibold text-neutral-600 dark:text-neutral-300 mb-5">
        学生が作った学生向けAI補助アプリ
      </p>

      {/* 概要テキスト */}
      <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-xl leading-relaxed mb-10">
        科学的リサーチ・アプローチ判定ツール。あなたの問いや興味から、最適な研究手順や日常の具体案を、
        <span className="text-violet-500 dark:text-violet-400 font-semibold">S〜Cのティア表</span>と
        <span className="text-cyan-500 dark:text-cyan-400 font-semibold">インタラクティブな統計グラフ</span>で
        視覚的にわかりやすく可視化します。
      </p>

      {/* フィーチャー説明カード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
        {[
          { emoji: "🏆", title: "S〜Cティア表", desc: "実用案を格付け形式で直感的に提示" },
          { emoji: "📊", title: "全6種の統計グラフ", desc: "棒・折れ線・エリア・円・レーダー・複合グラフに対応" },
          { emoji: "💬", title: "連続質問対応", desc: "スレッド形式で深掘り質問が可能" },
        ].map(({ emoji, title, desc }) => (
          <div
            key={title}
            className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm text-left"
          >
            <span className="text-2xl">{emoji}</span>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mt-2">{title}</p>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-400 mt-8 animate-bounce">
        ↓ 下の入力欄から質問を始めてください
      </p>
    </motion.div>
  );
}
