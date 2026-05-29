"use client";

import { useState } from "react";
import { Send, Loader2, RotateCcw } from "lucide-react";
import { OptionToggles } from "./OptionToggles";
import type { UserType, AgeGroup, PredictRequest, Lang } from "@/app/types";
import type { Translations } from "@/app/lib/i18n/translations";

// 内部 UserType 値（バックエンドへ送る固定日本語キー）
const INTERNAL_USER_TYPES: UserType[] = [
  "中学生", "高校生", "大学生", "大学院生",       // idx 0〜3 (学生)
  "大卒社会人", "大学院卒社会人", "シニア社会人",  // idx 4〜6 (社会人)
];

interface ChatPanelProps {
  isLoading: boolean;
  onSubmit: (req: PredictRequest) => void;
  onReset: () => void;
  hasResult: boolean;
  lang: Lang;
  t: Translations;
}

export function ChatPanel({ isLoading, onSubmit, onReset, hasResult, lang, t }: ChatPanelProps) {
  const [question, setQuestion] = useState("");
  const [userTypeIdx, setUserTypeIdx] = useState(2); // default: 大学生
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("指定なし");
  const [showSources, setShowSources] = useState(true);
  const [showChart, setShowChart] = useState(true);

  const handleSubmit = () => {
    if (!question.trim() || isLoading) return;
    onSubmit({
      question: question.trim(),
      userType: INTERNAL_USER_TYPES[userTypeIdx],
      ageGroup,
      showSources,
      showChart,
      lang,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 質問テキストエリア */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
          {t.inputLabel}
        </label>
        <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm focus-within:ring-2 focus-within:ring-violet-500/40 focus-within:border-violet-400 transition-all duration-200">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.inputPlaceholder}
            rows={4}
            className="w-full px-4 pt-4 pb-12 bg-transparent text-neutral-800 dark:text-neutral-100 text-sm placeholder-neutral-400 resize-none outline-none leading-relaxed"
            maxLength={500}
          />
          <div className="absolute bottom-3 left-4 right-3 flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              {question.length}/500{t.charLimit} &nbsp;·&nbsp; {t.ctrlEnter}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!question.trim() || isLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-semibold shadow-md shadow-violet-500/30 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {isLoading ? t.analyzing : t.analyzeBtn}
            </button>
          </div>
        </div>
      </div>

      {/* サジェスト例 */}
      {!hasResult && (
        <div>
          <p className="text-xs text-neutral-400 mb-2 font-medium">{t.exampleLabel}</p>
          <div className="flex flex-wrap gap-2">
            {(t?.exampleQuestions ?? []).map((q) => (
              <button
                key={q}
                onClick={() => setQuestion(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-150 bg-white dark:bg-neutral-800"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* オプション設定 */}
      <OptionToggles
        userTypeIdx={userTypeIdx}
        userTypeLabels={t.userTypes}
        proUserTypeLabels={t.proUserTypes}
        ageGroup={ageGroup}
        showSources={showSources}
        showChart={showChart}
        onUserTypeChange={setUserTypeIdx}
        onAgeGroupChange={setAgeGroup}
        onShowSourcesChange={setShowSources}
        onShowChartChange={setShowChart}
        t={t}
      />

      {/* リセットボタン */}
      {hasResult && (
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors duration-150 mx-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {t.resetBtn}
        </button>
      )}
    </div>
  );
}
