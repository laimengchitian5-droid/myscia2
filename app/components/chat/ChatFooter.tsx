"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Settings2, ChevronUp, Zap, FlaskConical, Briefcase } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { OptionToggles } from "./OptionToggles";
import type { ResearchDepth, Plan } from "@/app/types";
import type { ThreadSettings } from "@/app/types/chat";
import type { Translations } from "@/app/lib/i18n/translations";

// ── プラン定義 ───────────────────────────────────────────
const PLANS: { key: Plan; label: string; icon: React.ElementType; color: string }[] = [
  { key: "personal",    label: "個人向け",  icon: FlaskConical, color: "violet" },
  { key: "enterprise",  label: "企業向け",  icon: Briefcase,    color: "cyan"   },
  { key: "researcher",  label: "研究員向け", icon: Zap,          color: "amber"  },
];

const PLAN_ACTIVE_CLASS: Record<Plan, string> = {
  personal:   "bg-violet-500 text-white shadow-md shadow-violet-500/30",
  enterprise: "bg-cyan-500 text-white shadow-md shadow-cyan-500/30",
  researcher: "bg-amber-500 text-white shadow-md shadow-amber-500/30",
};

// ── Props ─────────────────────────────────────────────────
interface ChatFooterProps {
  onSend: (question: string, settings: ThreadSettings) => void;
  isLoading: boolean;
  hasThread: boolean;
  hasResponse: boolean;  // 回答生成後のみ設定UIを表示するフラグ
  settings: ThreadSettings;
  onSettingsChange: (s: ThreadSettings) => void;
  t: Translations;
}

export function ChatFooter({
  onSend, isLoading, hasThread, hasResponse,
  settings, onSettingsChange, t,
}: ChatFooterProps) {
  const [question,      setQuestion]      = useState("");
  const [settingsOpen,  setSettingsOpen]  = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 送信後にテキストエリアをリセット
  useEffect(() => {
    if (!question && textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  }, [question]);

  const handleSend = () => {
    if (!question.trim() || isLoading) return;
    onSend(question.trim(), settings);
    setQuestion("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "44px";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  };

  const setDepth    = (d: ResearchDepth) => onSettingsChange({ ...settings, researchDepth: d });
  const setPlan     = (p: Plan)          => onSettingsChange({ ...settings, plan: p });

  return (
    <footer className="flex-none border-t border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md z-10 safe-area-bottom">

      {/* ── 設定パネル（回答後のみ表示可能） ── */}
      <AnimatePresence>
        {settingsOpen && hasResponse && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-b border-neutral-200 dark:border-neutral-800"
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-5">

              {/* ── プラン選択 ── */}
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2.5">
                  プラン
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {PLANS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setPlan(key)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                        settings.plan === key
                          ? PLAN_ACTIVE_CLASS[key]
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-none" />
                      <span className="hidden xs:inline sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── リサーチの深さ ── */}
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2.5">
                  リサーチの深さ
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(["standard", "deep"] as ResearchDepth[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDepth(d)}
                      className={`py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
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
                  <p className="text-[10px] text-violet-500 dark:text-violet-400 mt-1.5">
                    ディープ: リスク・代替案・反証を含む高密度な分析（トークン消費大）
                  </p>
                )}
              </div>

              {/* ── 従来のオプション（ペルソナ・ソース等） ── */}
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
                  ペルソナ・出力設定
                </p>
                <OptionToggles
                  userTypeIdx={settings.userTypeIdx}
                  userTypeLabels={t?.userTypes ?? ["中学生", "高校生", "大学生", "大学院生"]}
                  proUserTypeLabels={t?.proUserTypes ?? ["大卒社会人", "大学院卒社会人", "シニア社会人"]}
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
        )}
      </AnimatePresence>

      {/* ── 入力行 ── */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3">
        <div className="flex gap-2 items-end">

          {/* 設定トグル（回答後のみ表示） */}
          {hasResponse && (
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              title="設定"
              className={`flex-none w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-150 ${
                settingsOpen
                  ? "bg-violet-500 border-violet-500 text-white"
                  : "border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-violet-500 hover:border-violet-400 bg-white dark:bg-neutral-900"
              }`}
            >
              {settingsOpen
                ? <ChevronUp className="w-4 h-4" />
                : <Settings2 className="w-4 h-4" />
              }
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
            onClick={handleSend}
            disabled={!question.trim() || isLoading}
            className="flex-none w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-md shadow-violet-500/30 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          >
            {isLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>

        {/* プラン表示バッジ（回答後） */}
        {hasResponse && (
          <div className="flex items-center gap-2 mt-1.5 px-1">
            <span className="text-[10px] text-neutral-400">
              {PLANS.find((p) => p.key === settings.plan)?.label ?? "個人向け"} ·{" "}
              {settings.researchDepth === "deep" ? "🔭 ディープ" : "📋 標準"}
            </span>
          </div>
        )}
      </div>
    </footer>
  );
}
