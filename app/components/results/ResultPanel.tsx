"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, AlertTriangle, Zap, Clock } from "lucide-react";
import { StatChart } from "./StatChart";
import type { PredictResponse, TierItem, Tier } from "@/app/types";
import type { Translations } from "@/app/lib/i18n/translations";

interface ResultPanelProps {
  data: PredictResponse;
  t: Translations;
}

type OuterTab = "overview" | "detailed" | "actions";
type InnerTab = "practical" | "academic";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ティア設定
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TIER_ORDER: Tier[] = ["S", "A", "B", "C"];

const TIER_CONFIG: Record<Tier, {
  badgeGradient: string;
  rowBg: string;
  actionColor: string;
  borderColor: string;
  glowColor: string;
  label: string;
}> = {
  S: {
    badgeGradient: "from-red-500 via-orange-500 to-yellow-400",
    rowBg: "bg-red-500/8 dark:bg-red-500/10",
    actionColor: "text-orange-600 dark:text-orange-300",
    borderColor: "border-orange-300/60 dark:border-orange-700/50",
    glowColor: "shadow-orange-500/20",
    label: "最優先",
  },
  A: {
    badgeGradient: "from-violet-600 via-purple-500 to-fuchsia-500",
    rowBg: "bg-violet-500/8 dark:bg-violet-500/10",
    actionColor: "text-violet-700 dark:text-violet-300",
    borderColor: "border-violet-300/60 dark:border-violet-700/50",
    glowColor: "shadow-violet-500/20",
    label: "重要",
  },
  B: {
    badgeGradient: "from-blue-600 via-cyan-500 to-sky-400",
    rowBg: "bg-cyan-500/8 dark:bg-cyan-500/10",
    actionColor: "text-cyan-700 dark:text-cyan-300",
    borderColor: "border-cyan-300/60 dark:border-cyan-700/50",
    glowColor: "shadow-cyan-500/20",
    label: "推奨",
  },
  C: {
    badgeGradient: "from-emerald-600 via-teal-500 to-green-400",
    rowBg: "bg-emerald-500/8 dark:bg-emerald-500/10",
    actionColor: "text-emerald-700 dark:text-emerald-300",
    borderColor: "border-emerald-300/60 dark:border-emerald-700/50",
    glowColor: "shadow-emerald-500/20",
    label: "補足",
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  メインコンポーネント
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function ResultPanel({ data, t }: ResultPanelProps) {
  const [outerTab, setOuterTab] = useState<OuterTab>("overview");
  const [innerTab, setInnerTab] = useState<InnerTab>("practical");

  const hasPractical = (data.practicalPlans?.length ?? 0) > 0;
  const hasAcademic  = (data.academicPlans?.length  ?? 0) > 0;
  const hasActions   = hasPractical || hasAcademic;

  const outerTabs: { key: OuterTab; label: string; enabled: boolean }[] = [
    { key: "overview",  label: t?.overviewLabel    ?? "概要",    enabled: true },
    { key: "detailed",  label: t?.detailedLabel    ?? "詳細分析", enabled: !!data.detailedExplanation },
    { key: "actions",   label: t?.actionPlansLabel ?? "実用案",   enabled: hasActions },
  ];

  return (
    <div className="space-y-4">
      {/* フォールバック警告 */}
      {data.isFallback && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50"
        >
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-none mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{t?.demoWarningTitle}</p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">{data.errorMessage}</p>
          </div>
        </motion.div>
      )}

      {/* メタバッジ */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium">
          <Zap className="w-3 h-3" />{data.provider} / {data.model}
        </span>
        {data.latencyMs > 0 && (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium">
            <Clock className="w-3 h-3" />{(data.latencyMs / 1000).toFixed(2)}s
          </span>
        )}
      </div>

      {/* 研究分野 / 手法 / 指標カード */}
      <div className="grid grid-cols-1 gap-3">
        <ResultCard emoji="🎯" label={t?.fieldLabel   ?? "研究分野"} content={data.field.replace(/^🎯\s*/,  "")}
          gradient="from-violet-500/10 to-fuchsia-500/10" border="border-violet-200 dark:border-violet-800/50" textColor="text-violet-700 dark:text-violet-300" />
        <ResultCard emoji="🔬" label={t?.methodLabel  ?? "研究手法"} content={data.method.replace(/^🔬\s*/, "")}
          gradient="from-cyan-500/10 to-blue-500/10"     border="border-cyan-200 dark:border-cyan-800/50"    textColor="text-cyan-700 dark:text-cyan-300" />
        <ResultCard emoji="📊" label={t?.metricsLabel ?? "統計指標"} content={data.metrics.replace(/^📊\s*/,"")}
          gradient="from-emerald-500/10 to-teal-500/10"  border="border-emerald-200 dark:border-emerald-800/50" textColor="text-emerald-700 dark:text-emerald-300" />
      </div>

      {/* ━━━ 外側3タブ ━━━ */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        {/* タブバー */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800">
          {outerTabs.map(({ key, label, enabled }) => (
            <button key={key} onClick={() => setOuterTab(key)} disabled={!enabled}
              className={`relative flex-1 py-3 text-xs font-semibold transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${
                outerTab === key
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              }`}
            >
              {label}
              {outerTab === key && (
                <motion.span layoutId="outer-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500" />
              )}
            </button>
          ))}
        </div>

        <div className="p-4 min-h-[140px]">
          <AnimatePresence mode="wait">

            {/* 概要タブ */}
            {outerTab === "overview" && (
              <motion.div key="overview"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {data.explanation}
                </p>
              </motion.div>
            )}

            {/* 詳細分析タブ */}
            {outerTab === "detailed" && (
              <motion.div key="detailed"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {data.detailedExplanation
                  ? <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">{data.detailedExplanation}</p>
                  : <p className="text-sm text-neutral-400 italic">詳細な解説はありません</p>
                }
              </motion.div>
            )}

            {/* 実用案タブ（ティア表） */}
            {outerTab === "actions" && (
              <motion.div key="actions"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {/* 内側タブバー */}
                <div className="flex gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 mb-4">
                  <InnerTabButton
                    active={innerTab === "practical"}
                    label={t?.practicalPlansLabel ?? "💡 日常の具体案"}
                    onClick={() => setInnerTab("practical")}
                    disabled={!hasPractical}
                    color="amber"
                  />
                  <InnerTabButton
                    active={innerTab === "academic"}
                    label={t?.academicPlansLabel  ?? "🔬 研究・調査の手順"}
                    onClick={() => setInnerTab("academic")}
                    disabled={!hasAcademic}
                    color="violet"
                  />
                </div>

                {/* ティア表コンテンツ */}
                <AnimatePresence mode="wait">
                  {innerTab === "practical" && (
                    <motion.div key="practical"
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.18 }}
                    >
                      <TierTable plans={data.practicalPlans ?? []} />
                    </motion.div>
                  )}
                  {innerTab === "academic" && (
                    <motion.div key="academic"
                      initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.18 }}
                    >
                      <TierTable plans={data.academicPlans ?? []} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* 統計グラフ */}
      {data.chartData && data.chartData.length > 0 && (
        <div className="p-4 rounded-2xl bg-neutral-950 dark:bg-neutral-900 border border-neutral-800 shadow-sm">
          <StatChart data={data.chartData} t={t} />
        </div>
      )}

      {/* ソース */}
      {data.sources && data.sources.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
            {t?.sourcesLabel ?? "参考文献"}
          </p>
          <ul className="space-y-2">
            {data.sources.map((src, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-xs text-neutral-400 flex-none mt-0.5 font-mono w-4">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  {src.url
                    ? <a href={src.url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 break-all">
                        {src.title}<ExternalLink className="w-3 h-3 flex-none" />
                      </a>
                    : <span className="text-sm text-neutral-600 dark:text-neutral-300">{src.title}</span>
                  }
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TierTable — S〜Cランクティア表コンポーネント
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TierTable({ plans }: { plans: TierItem[] }) {
  if (!plans || plans.length === 0) {
    return <p className="text-sm text-neutral-400 italic">データがありません</p>;
  }

  // ティア別にグループ化
  const grouped = TIER_ORDER.reduce<Record<Tier, TierItem[]>>((acc, tier) => {
    acc[tier] = plans.filter((p) => p.tier === tier);
    return acc;
  }, { S: [], A: [], B: [], C: [] });

  return (
    <div className="space-y-2">
      {/* ヘッダー行 */}
      <div className="flex items-center gap-2 mb-1 px-1">
        <span className="w-12 flex-none" />
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest" style={{ width: "38%" }}>
          アクション
        </span>
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex-1">
          ＋α 知識 / 解説
        </span>
      </div>

      {TIER_ORDER.map((tier) => {
        const items = grouped[tier];
        if (!items || items.length === 0) return null;
        const cfg = TIER_CONFIG[tier];

        return (
          <motion.div
            key={tier}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: TIER_ORDER.indexOf(tier) * 0.06, duration: 0.22 }}
            className={`flex rounded-xl border ${cfg.borderColor} overflow-hidden shadow-sm ${cfg.glowColor}`}
          >
            {/* ━ ティアバッジ（全アイテム共通の縦プレート） ━ */}
            <div className={`flex-none w-12 flex flex-col items-center justify-center bg-gradient-to-b ${cfg.badgeGradient} py-3 gap-1`}>
              <span className="text-white font-black text-2xl leading-none drop-shadow-md">
                {tier}
              </span>
              <span className="text-white/80 text-[8px] font-bold tracking-wider leading-none">
                {cfg.label}
              </span>
            </div>

            {/* ━ アイテム列 ━ */}
            <div className="flex-1 divide-y divide-neutral-200/50 dark:divide-neutral-700/40">
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: TIER_ORDER.indexOf(tier) * 0.06 + i * 0.04, duration: 0.18 }}
                  className="flex min-h-[56px]"
                >
                  {/* 左列: アクション（40%） */}
                  <div className={`flex-none px-3 py-3 flex items-center ${cfg.rowBg}`} style={{ width: "40%" }}>
                    <p className={`text-xs font-bold ${cfg.actionColor} leading-snug`}>
                      {item.action}
                    </p>
                  </div>

                  {/* 右列: インサイト（60%） */}
                  <div className="flex-1 px-3 py-3 flex items-center bg-white/60 dark:bg-neutral-800/40">
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      {item.insight || <span className="italic text-neutral-400">—</span>}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  サブコンポーネント
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function InnerTabButton({
  active, label, onClick, disabled, color,
}: {
  active: boolean; label: string; onClick: () => void; disabled: boolean; color: "amber" | "violet";
}) {
  const activeClass = color === "amber"
    ? "bg-white dark:bg-neutral-700 text-amber-600 dark:text-amber-400 shadow-sm"
    : "bg-white dark:bg-neutral-700 text-violet-600 dark:text-violet-400 shadow-sm";

  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
        active ? activeClass : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
      }`}
    >
      {label}
    </button>
  );
}

function ResultCard({ emoji, label, content, gradient, border, textColor }: {
  emoji: string; label: string; content: string;
  gradient: string; border: string; textColor: string;
}) {
  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} border ${border}`}>
      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
        {emoji} {label}
      </p>
      <p className={`text-sm font-semibold ${textColor} leading-relaxed`}>{content}</p>
    </div>
  );
}
