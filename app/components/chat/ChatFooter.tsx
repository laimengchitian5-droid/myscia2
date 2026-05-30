"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Loader2, Settings2, X,
  Zap, FlaskConical, Briefcase,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { OptionToggles } from "./OptionToggles";
import type { ResearchDepth, Plan } from "@/app/types";
import type { ThreadSettings } from "@/app/types/chat";
import type { Translations } from "@/app/lib/i18n/translations";

// ── プラン定義 ────────────────────────────────────────────
const PLANS: { key: Plan; label: string; icon: React.ElementType }[] = [
  { key: "personal",   label: "個人向け",   icon: FlaskConical },
  { key: "enterprise", label: "企業向け",   icon: Briefcase    },
  { key: "researcher", label: "研究員向け", icon: Zap          },
];

const PLAN_ACTIVE: Record<Plan, string> = {
  personal:   "bg-violet-500 text-white shadow-md shadow-violet-500/30",
  enterprise: "bg-cyan-500 text-white shadow-md shadow-cyan-500/30",
  researcher: "bg-amber-500 text-white shadow-md shadow-amber-500/30",
};

interface ChatFooterProps {
  onSend: (question: string, settings: ThreadSettings) => void;
  isLoading: boolean;
  hasThread: boolean;
  hasResponse: boolean;
  settings: ThreadSettings;
  onSettingsChange: (s: ThreadSettings) => void;
  t: Translations;
}

export function ChatFooter({
  onSend, isLoading, hasThread, hasResponse,
  settings, onSettingsChange, t,
}: ChatFooterProps) {
  const [question,     setQuestion]     = useState("");
  const [modalOpen,    setModalOpen]    = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 送信後にテキストエリア高さをリセット
  useEffect(() => {
    if (!question && textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  }, [question]);

  // 新規チャット（hasResponse → false）でモーダルを自動クローズ
  useEffect(() => {
    if (!hasResponse) setModalOpen(false);
  }, [hasResponse]);

  const handleSend = useCallback(() => {
    if (!question.trim() || isLoading) return;
    onSend(question.trim(), settings);
    setQuestion("");
  }, [question, isLoading, onSend, settings]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "44px";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  };

  const openModal  = useCallback(() => setModalOpen(true),  []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const setDepth = (d: ResearchDepth) => onSettingsChange({ ...settings, researchDepth: d });
  const setPlan  = (p: Plan)          => onSettingsChange({ ...settings, plan: p });

  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          設定モーダル — fixed 最前面 Bottom Sheet
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <AnimatePresence>
        {modalOpen && (
          <>
            {/* バックドロップ（クリックで閉じる） */}
            <motion.div
              key="settings-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
            />

            {/* Bottom Sheet パネル */}
            <motion.div
              key="settings-panel"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              {/* ハンドルバー */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              </div>

              {/* ヘッダー */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 dark:border-neutral-800">
                <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                  ⚙️ リサーチ設定
                </h2>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* コンテンツ */}
              <div className="px-5 py-5 space-y-6 pb-10">

                {/* ── プラン選択 ── */}
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
                    プラン
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {PLANS.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setPlan(key)}
                        className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          settings.plan === key
                            ? PLAN_ACTIVE[key]
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── リサーチの深さ ── */}
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
                    リサーチの深さ
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["standard", "deep"] as ResearchDepth[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDepth(d)}
                        className={`py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                          settings.researchDepth === d
                            ? d === "deep"
                              ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/30"
                              : "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-sm"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {d === "standard" ? "📋 標準" : "🔭 ディープ"}
                      </button>
                    ))}
                  </div>
                  {settings.researchDepth === "deep" && (
                    <p className="text-[10px] text-violet-500 dark:text-violet-400 mt-1.5 leading-relaxed">
                      ディープモード：リスク・代替案・反証を含む高密度分析（トークン消費大）
                    </p>
                  )}
                </div>

                {/* ── ペルソナ・出力設定 ── */}
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-5">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">
                    ペルソナ・出力設定
                  </p>
                  <OptionToggles
                    userTypeIdx={settings.userTypeIdx}
                    userTypeLabels={t.userTypes}
                    proUserTypeLabels={t.proUserTypes}
                    ageGroup={settings.ageGroup}
                    showSources={settings.showSources}
                    showChart={settings.showChart}
                    onUserTypeChange={(idx) => onSettingsChange({ ...settings, userTypeIdx: idx })}
                    onAgeGroupChange={(v)    => onSettingsChange({ ...settings, ageGroup: v })}
                    onShowSourcesChange={(v) => onSettingsChange({ ...settings, showSources: v })}
                    onShowChartChange={(v)   => onSettingsChange({ ...settings, showChart: v })}
                    t={t}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          フッター入力バー（常時表示）
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="flex-none border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3">
          <div className="flex gap-2 items-end">

            {/* ⚙️ 設定ボタン（回答後のみ / 最前面確保） */}
            {hasResponse && (
              <button
                type="button"
                onClick={openModal}
                title="リサーチ設定を開く"
                className="relative z-30 flex-none w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer pointer-events-auto border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-500 hover:text-violet-500 hover:border-violet-400 dark:hover:text-violet-400 dark:hover:border-violet-500 transition-all duration-150 select-none"
              >
                <Settings2 className="w-4 h-4 pointer-events-none" />
              </button>
            )}

            {/* テキストエリア */}
            <div className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus-within:ring-2 focus-within:ring-violet-500/40 focus-within:border-violet-400 transition-all duration-200 shadow-sm overflow-hidden">
              <textarea
                ref={textareaRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                placeholder={
                  hasThread
                    ? "この文脈で追加質問する… (Ctrl+Enter で送信)"
                    : (t?.inputPlaceholder ?? "リサーチしたい疑問を入力… (Ctrl+Enter で送信)")
                }
                rows={1}
                style={{ minHeight: "44px", maxHeight: "140px" }}
                className="w-full px-4 py-3 bg-transparent text-neutral-800 dark:text-neutral-100 text-sm placeholder-neutral-400 resize-none outline-none leading-relaxed overflow-y-auto"
              />
            </div>

            {/* 送信ボタン */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!question.trim() || isLoading}
              title={t?.analyzeBtn ?? "送信"}
              className="flex-none w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-md shadow-violet-500/30 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
            >
              {isLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>
          </div>

          {/* 現在の設定サマリー（回答後のみ） */}
          {hasResponse && (
            <p className="text-[10px] text-neutral-400 mt-1.5 px-1">
              {PLANS.find((p) => p.key === settings.plan)?.label ?? "個人向け"} ·{" "}
              {settings.researchDepth === "deep" ? "🔭 ディープ" : "📋 標準"}
              {" · "}
              <button
                type="button"
                onClick={openModal}
                className="underline underline-offset-2 hover:text-violet-500 transition-colors cursor-pointer"
              >
                設定を変更
              </button>
            </p>
          )}
        </div>
      </footer>
    </>
  );
}
