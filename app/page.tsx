"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar }     from "@/app/components/layout/Sidebar";
import { MessageLog }  from "@/app/components/chat/MessageLog";
import { ChatFooter }  from "@/app/components/chat/ChatFooter";
import type { PredictRequest, PredictResponse, UserType, Lang } from "@/app/types";
import type { ChatMessage, ChatThread, ThreadSettings } from "@/app/types/chat";
import type { Translations } from "@/app/lib/i18n/translations";
import { TRANSLATIONS } from "@/app/lib/i18n/translations";
import { buildCacheKey, getCache, setCache } from "@/app/lib/cache";
import { FlaskConical } from "lucide-react";
import { motion } from "framer-motion";

// UserType の内部値テーブル
const INTERNAL_USER_TYPES: UserType[] = [
  "中学生", "高校生", "大学生", "大学院生",
  "大卒社会人", "大学院卒社会人", "シニア社会人",
];

const SUPPORTED_LANGS: Lang[] = ["ja", "en", "zh", "ko"];

const DEFAULT_SETTINGS: ThreadSettings = {
  userTypeIdx:   2,
  ageGroup:      "指定なし",
  showSources:   true,
  showChart:     true,
  researchDepth: "standard",
  plan:          "personal",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  メインページ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function HomePage() {
  const [isDark,          setIsDark]          = useState(false);
  const [lang,            setLang]            = useState<Lang>("ja");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileDrawer,    setMobileDrawer]    = useState(false);

  const [threads,        setThreads]        = useState<ChatThread[]>([]);
  const [trashedThreads, setTrashedThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [loadingThreadId, setLoadingThreadId] = useState<string | null>(null);

  const [globalSettings, setGlobalSettings] = useState<ThreadSettings>(DEFAULT_SETTINGS);

  const t: Translations = TRANSLATIONS[lang] ?? TRANSLATIONS.ja;

  const currentThread  = threads.find((th) => th.id === activeThreadId) ?? null;
  const isLoading      = loadingThreadId !== null;
  const hasResponse    = (currentThread?.messages ?? []).some((m) => m.role === "assistant");

  const activeSettings: ThreadSettings = currentThread
    ? {
        userTypeIdx:   currentThread.userTypeIdx,
        ageGroup:      currentThread.ageGroup,
        showSources:   currentThread.showSources,
        showChart:     currentThread.showChart,
        researchDepth: currentThread.researchDepth,
        plan:          currentThread.plan,
      }
    : globalSettings;

  // ── useEffect ──────────────────────────────
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const browserLangs = navigator.languages ?? [navigator.language];
    for (const bl of browserLangs) {
      const code = bl.slice(0, 2) as Lang;
      if (SUPPORTED_LANGS.includes(code)) { setLang(code); break; }
    }
  }, []);

  // ── スレッド操作 ──────────────────────────
  const handleNewChat = useCallback(() => {
    setActiveThreadId(null);
    setMobileDrawer(false);
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

    let threadId = activeThreadId;

    if (!threadId) {
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
      setThreads((prev) =>
        prev.map((t) => t.id === threadId ? { ...t, ...settings } : t)
      );
    }

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

    // ── キャッシュチェック（API呼び出し前） ──────────────
    const cacheKey = buildCacheKey(question, settings, lang);
    const cached   = getCache(cacheKey);

    if (cached) {
      // キャッシュヒット → API ゼロコール
      const cachedMsg: ChatMessage = {
        id:        crypto.randomUUID(),
        role:      "assistant",
        content:   cached.explanation ?? "解析が完了しました。",
        jsonData:  { ...cached, fromCache: true },
        timestamp: Date.now(),
      };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, messages: [...t.messages, cachedMsg] } : t
        )
      );
      setLoadingThreadId(null);
      return;
    }

    setLoadingThreadId(threadId);

    try {
      const reqBody: PredictRequest = {
        question:      question.trim(),
        userType:      INTERNAL_USER_TYPES[settings.userTypeIdx],
        ageGroup:      settings.ageGroup,
        showSources:   settings.showSources,
        showChart:     settings.showChart,
        lang,
        researchDepth: settings.researchDepth,
        plan:          settings.plan,
      };

      const res  = await fetch("/api/predict", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(reqBody),
      });
      const json = (await res.json()) as PredictResponse;

      // 成功レスポンスをキャッシュに保存
      setCache(cacheKey, json);

      const assistantMsg: ChatMessage = {
        id:        crypto.randomUUID(),
        role:      "assistant",
        content:   json.explanation ?? "解析が完了しました。",
        jsonData:  json,
        timestamp: Date.now(),
      };

      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, messages: [...t.messages, assistantMsg] } : t
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

      {/* ── サイドバー（モバイル: ドロワー / デスクトップ: インライン） ── */}
      <Sidebar
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded((v) => !v)}
        onNewChat={handleNewChat}
        mobileOpen={mobileDrawer}
        onMobileClose={() => setMobileDrawer(false)}
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
      />

      {/* ── メインエリア ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ヘッダー（モバイルハンバーガー付き） */}
        <MobileHeader
          onHamburger={() => setMobileDrawer(true)}
          isDark={isDark}
          onToggleTheme={() => setIsDark((d) => !d)}
        />

        {/* Gemini風グラデーション帯 */}
        <div className="h-px w-full flex-none bg-gradient-to-r from-violet-500 via-fuchsia-500 via-cyan-400 to-blue-500 animate-gradient" />

        {/* コンテンツエリア */}
        <main className="flex-1 overflow-y-auto">
          {!currentThread || currentThread.messages.length === 0 ? (
            <LandingScreen t={t} />
          ) : (
            <MessageLog
              thread={currentThread}
              isLoading={isLoading && loadingThreadId === activeThreadId}
              t={t}
            />
          )}
        </main>

        {/* チャット入力フッター */}
        <ChatFooter
          onSend={handleSendMessage}
          isLoading={isLoading}
          hasThread={!!currentThread}
          hasResponse={hasResponse}
          settings={activeSettings}
          onSettingsChange={handleSettingsChange}
          t={t}
        />
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  モバイルヘッダー（ハンバーガー + テーマトグル）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MobileHeader({
  onHamburger, isDark, onToggleTheme,
}: {
  onHamburger: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200/70 dark:border-neutral-800/70 backdrop-blur-md bg-white/80 dark:bg-neutral-950/80 flex-none">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* ハンバーガー（モバイルのみ表示） */}
        <button
          onClick={onHamburger}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="メニューを開く"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* ロゴ（モバイルのみ表示） */}
        <span className="md:hidden text-sm font-bold text-neutral-900 dark:text-white">
          Scia<span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">Source</span>
        </span>

        {/* テーマトグル（Header から button だけ抽出） */}
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
          aria-label="テーマ切り替え"
        >
          {isDark
            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="2"/></svg>
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          }
        </button>
      </div>
    </header>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ウェルカム画面
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LandingScreen({ t }: { t: Translations }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center"
    >
      {/* ロゴ */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-violet-500/25 mb-5">
        <FlaskConical className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
      </div>

      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-3">
        Scia
        <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
          Source
        </span>
      </h1>

      {/* サブタイトル */}
      <p className="text-base sm:text-lg font-semibold text-neutral-600 dark:text-neutral-300 mb-4">
        学生が作った学生向けAI補助アプリ
      </p>

      {/* 概要テキスト */}
      <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-xl leading-relaxed mb-10">
        科学的リサーチ・アプローチ判定ツール。あなたの問いや興味から、最適な研究手順や日常の具体案を、
        <span className="text-violet-500 dark:text-violet-400 font-semibold">S〜Cのティア表</span>と
        <span className="text-cyan-500 dark:text-cyan-400 font-semibold">インタラクティブな統計グラフ</span>で
        視覚的にわかりやすく可視化します。
      </p>

      {/* フィーチャーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl w-full">
        {[
          { emoji: "🏆", title: "S〜Cティア表",     desc: "実用案を格付け形式で直感的に提示" },
          { emoji: "📊", title: "全6種の統計グラフ", desc: "棒・折れ線・エリア・円・レーダー・複合グラフ" },
          { emoji: "💬", title: "連続質問対応",      desc: "スレッド形式で深掘り質問が可能" },
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
