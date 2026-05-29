"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Settings2, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { OptionToggles } from "./OptionToggles";
import type { ThreadSettings } from "@/app/types/chat";
import type { Translations } from "@/app/lib/i18n/translations";

interface ChatFooterProps {
  onSend: (question: string, settings: ThreadSettings) => void;
  isLoading: boolean;
  hasThread: boolean;
  settings: ThreadSettings;
  onSettingsChange: (s: ThreadSettings) => void;
  t: Translations;
}

export function ChatFooter({
  onSend,
  isLoading,
  hasThread,
  settings,
  onSettingsChange,
  t,
}: ChatFooterProps) {
  const [question, setQuestion]       = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 送信後にテキストエリアの高さをリセット
  useEffect(() => {
    if (textareaRef.current) {
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

  return (
    <footer className="flex-none border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md z-10">
      {/* ── 設定パネル（スライドアップ） ── */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-b border-neutral-200 dark:border-neutral-800"
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
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
                onAgeGroupChange={(v)   => onSettingsChange({ ...settings, ageGroup: v })}
                onShowSourcesChange={(v) => onSettingsChange({ ...settings, showSources: v })}
                onShowChartChange={(v)  => onSettingsChange({ ...settings, showChart: v })}
                t={t}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 入力行 ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex gap-2 items-end">
          {/* 設定トグルボタン */}
          <button
            onClick={() => setSettingsOpen((v) => !v)}
            title="ペルソナ設定"
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

          {/* テキストエリア */}
          <div className="flex-1 relative rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus-within:ring-2 focus-within:ring-violet-500/40 focus-within:border-violet-400 transition-all duration-200 shadow-sm overflow-hidden">
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
            title={t?.analyzeBtn ?? "送信"}
            className="flex-none w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-md shadow-violet-500/30 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          >
            {isLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>
      </div>
    </footer>
  );
}
