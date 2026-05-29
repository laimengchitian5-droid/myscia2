"use client";

import { useState, useEffect } from "react";
import { Header } from "@/app/components/layout/Header";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { ChatPanel } from "@/app/components/chat/ChatPanel";
import { ResultPanel } from "@/app/components/results/ResultPanel";
import { usePrediction } from "@/app/hooks/usePrediction";
import type { PredictRequest, Lang } from "@/app/types";
import type { Translations } from "@/app/lib/i18n/translations";
import { TRANSLATIONS } from "@/app/lib/i18n/translations";
import { FlaskConical, Loader2 } from "lucide-react";

const SUPPORTED_LANGS: Lang[] = ["ja", "en", "zh", "ko"];

export default function HomePage() {
  const [isDark, setIsDark] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [lang, setLang] = useState<Lang>("ja");
  const { data, isLoading, error, predict, reset } = usePrediction();

  // TRANSLATIONS[lang] が未解決の瞬間（Fast Refresh 等）でもクラッシュしないようフォールバック
  const t: Translations = TRANSLATIONS[lang] ?? TRANSLATIONS.ja;

  // テーマ初期化（システム設定に合わせる）
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
  }, []);

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

  // テーマ適用
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleSubmit = (req: PredictRequest) => {
    predict({ ...req, lang });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
      {/* ── サイドバー ── */}
      <Sidebar
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded((v) => !v)}
        onNewChat={reset}
        lang={lang}
        onLangChange={setLang}
        t={t}
        isDark={isDark}
      />

      {/* ── メインコンテンツ ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header isDark={isDark} onToggleTheme={() => setIsDark((d) => !d)} t={t} />

        {/* Gemini風グラデーション帯 */}
        <div className="h-px w-full flex-none bg-gradient-to-r from-violet-500 via-fuchsia-500 via-cyan-400 to-blue-500 animate-gradient" />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
          {/* ヒーローヘッダー（初回表示時のみ） */}
          {!data && !isLoading && (
            <div className="text-center mb-10 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 shadow-2xl shadow-violet-500/25 mb-5">
                <FlaskConical className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
                Scia
                <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                  Source
                </span>
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 text-base max-w-md mx-auto leading-relaxed">
                {t.appDesc}
              </p>
            </div>
          )}

          {/* 2カラムレイアウト */}
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
            {/* 左: チャット入力パネル */}
            <div className="lg:sticky lg:top-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-5">
              <ChatPanel
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onReset={reset}
                hasResult={!!data}
                lang={lang}
                t={t}
              />
            </div>

            {/* 右: 結果パネル */}
            <div className="min-h-[200px]">
              {isLoading && <LoadingSkeleton t={t} />}

              {error && !data && (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-neutral-400">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {data && (
                <div className="animate-fade-in-up">
                  <ResultPanel data={data} t={t} />
                </div>
              )}

              {!data && !isLoading && !error && (
                <EmptyState t={t} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function LoadingSkeleton({ t }: { t: Translations }) {
  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
        <div>
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{t.loadingTitle}</p>
          <p className="text-xs text-neutral-400 mt-0.5">{t.loadingDesc}</p>
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-20 rounded-2xl animate-shimmer"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

function EmptyState({ t }: { t: Translations }) {
  return (
    <div className="flex flex-col items-center justify-center h-80 gap-4 text-center px-6">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center">
        <FlaskConical className="w-9 h-9 text-neutral-300 dark:text-neutral-600" />
      </div>
      <div>
        <p className="text-base font-semibold text-neutral-400 dark:text-neutral-500">{t.emptyTitle}</p>
        <p className="text-sm text-neutral-300 dark:text-neutral-600 mt-1">{t.emptyDesc}</p>
      </div>
    </div>
  );
}
