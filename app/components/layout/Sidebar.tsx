"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, Plus, History, Settings, HelpCircle,
  FlaskConical, ChevronRight, Globe,
  Trash2, Undo2, X, ChevronDown,
} from "lucide-react";
import type { Lang, Translations } from "@/app/lib/i18n/translations";
import { LANG_LABELS } from "@/app/lib/i18n/translations";

// ── 型定義 ──────────────────────────────────────────
type HistoryItem = { id: string; question: string };

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  t: Translations;
  isDark: boolean;
}

// ── 初期モックデータ ──────────────────────────────────
const INITIAL_HISTORY: HistoryItem[] = [
  { id: "1", question: "睡眠と記憶力の関係" },
  { id: "2", question: "SNSとメンタルヘルス" },
  { id: "3", question: "プラシーボ効果のメカニズム" },
  { id: "4", question: "運動と認知機能" },
  { id: "5", question: "食事と気分の相関" },
];

const LANGS: Lang[] = ["ja", "en", "zh", "ko"];
const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 68;

export function Sidebar({ isExpanded, onToggle, onNewChat, lang, onLangChange, t }: SidebarProps) {
  const [history,   setHistory]   = useState<HistoryItem[]>(INITIAL_HISTORY);
  const [trash,     setTrash]     = useState<HistoryItem[]>([]);
  const [trashOpen, setTrashOpen] = useState(false);
  const [activeId,  setActiveId]  = useState<string | null>(null);

  // ── アクション ────────────────────────────────────
  const handleDelete = (item: HistoryItem) => {
    setHistory((prev) => prev.filter((h) => h.id !== item.id));
    setTrash((prev) => [item, ...prev]);
    if (activeId === item.id) {
      setActiveId(null);
      onNewChat(); // アクティブ履歴を削除→メイン画面リセット
    }
  };

  const handleRestore = (item: HistoryItem) => {
    setTrash((prev) => prev.filter((t) => t.id !== item.id));
    setHistory((prev) => [...prev, item]);
  };

  const handleDeleteForever = (item: HistoryItem) => {
    setTrash((prev) => prev.filter((t) => t.id !== item.id));
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setActiveId(item.id);
  };

  const handleNewChat = () => {
    setActiveId(null);
    onNewChat();
  };

  const width = isExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;

  return (
    <motion.aside
      animate={{ width }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="flex-none h-screen sticky top-0 flex flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 overflow-hidden z-30"
    >
      {/* ── ヘッダー ── */}
      <div className="flex items-center gap-3 px-3 h-14 flex-none border-b border-neutral-100 dark:border-neutral-800">
        <button onClick={onToggle}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors duration-150 flex-none"
          aria-label="サイドバーの開閉"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 flex items-center justify-center flex-none">
                <FlaskConical className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold text-sm text-neutral-900 dark:text-white whitespace-nowrap">
                Scia<span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">Source</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 新しく判定するボタン ── */}
      <div className="px-2 pt-3 pb-2 flex-none">
        <button onClick={handleNewChat}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-sm transition-all duration-150 bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-md shadow-violet-500/20 hover:opacity-90 active:scale-[0.98] ${!isExpanded ? "justify-center" : ""}`}
        >
          <Plus className="w-4 h-4 flex-none" />
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {t?.newChat ?? "新しく判定する"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── 履歴リスト ── */}
      <div className="flex-1 overflow-y-auto px-2 py-1 min-h-0">
        {isExpanded && (
          <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-2 mb-1.5">
            {t?.historyTitle ?? "過去の履歴"}
          </p>
        )}

        {history.length === 0 && isExpanded && (
          <p className="text-xs text-neutral-400 px-2 py-2 italic">
            {t?.noHistoryLabel ?? "履歴がありません"}
          </p>
        )}

        <div className="space-y-0.5">
          <AnimatePresence initial={false}>
            {history.map((item) => (
              <HistoryRow
                key={item.id}
                item={item}
                isActive={activeId === item.id}
                isExpanded={isExpanded}
                onSelect={handleSelectHistory}
                onDelete={handleDelete}
                deleteLabel={t?.deleteHistoryLabel ?? "削除"}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── ゴミ箱アコーディオン ── */}
      <div className="flex-none px-2 pb-1">
        <TrashAccordion
          isExpanded={isExpanded}
          trash={trash}
          trashOpen={trashOpen}
          onToggleTrash={() => setTrashOpen((v) => !v)}
          onRestore={handleRestore}
          onDeleteForever={handleDeleteForever}
          t={t}
        />
      </div>

      {/* ── フッター（言語 / 設定 / ヘルプ） ── */}
      <div className="flex-none px-2 pb-3 pt-1 border-t border-neutral-100 dark:border-neutral-800 space-y-0.5">
        {/* 言語セレクター */}
        {isExpanded ? (
          <div className="px-2 py-1.5">
            <div className="flex items-center gap-2 mb-1.5">
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                {t?.languageLabel ?? "言語"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {LANGS.map((l) => (
                <button key={l} onClick={() => onLangChange(l)}
                  className={`text-xs py-1 px-1.5 rounded-lg font-medium transition-all duration-150 ${
                    lang === l
                      ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                      : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button className="w-full flex justify-center py-2 text-neutral-400 hover:text-violet-500 transition-colors">
            <Globe className="w-4 h-4" />
          </button>
        )}
        <SidebarFooterItem icon={<Settings  className="w-3.5 h-3.5" />} label={t?.settingsLabel ?? "設定"}  isExpanded={isExpanded} />
        <SidebarFooterItem icon={<HelpCircle className="w-3.5 h-3.5" />} label={t?.helpLabel    ?? "ヘルプ"} isExpanded={isExpanded} />
      </div>
    </motion.aside>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  HistoryRow — ホバーで削除ボタン表示
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function HistoryRow({
  item, isActive, isExpanded, onSelect, onDelete, deleteLabel,
}: {
  item: HistoryItem;
  isActive: boolean;
  isExpanded: boolean;
  onSelect: (item: HistoryItem) => void;
  onDelete: (item: HistoryItem) => void;
  deleteLabel: string;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`group flex items-center gap-2 px-2 py-2 rounded-lg transition-colors duration-100 cursor-pointer ${
        isActive
          ? "bg-violet-50 dark:bg-violet-900/20"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
      } ${!isExpanded ? "justify-center" : ""}`}
      >
        <button onClick={() => onSelect(item)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
          <History className={`w-3.5 h-3.5 flex-none transition-colors ${isActive ? "text-violet-500" : "text-neutral-400 group-hover:text-violet-500"}`} />
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                className={`text-xs truncate flex-1 ${isActive ? "text-violet-700 dark:text-violet-300 font-medium" : "text-neutral-600 dark:text-neutral-300"}`}
              >
                {item.question}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* ホバー時にのみ表示される削除ボタン */}
        {isExpanded && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item); }}
            title={deleteLabel}
            className="flex-none opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-400 hover:text-red-500 transition-all duration-150"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TrashAccordion — ゴミ箱アコーディオン
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TrashAccordion({
  isExpanded, trash, trashOpen, onToggleTrash, onRestore, onDeleteForever, t,
}: {
  isExpanded: boolean;
  trash: HistoryItem[];
  trashOpen: boolean;
  onToggleTrash: () => void;
  onRestore: (item: HistoryItem) => void;
  onDeleteForever: (item: HistoryItem) => void;
  t: Translations;
}) {
  const trashLabel       = t?.trashLabel        ?? "ゴミ箱";
  const trashEmptyLabel  = t?.trashEmptyLabel   ?? "ゴミ箱は空です";
  const restoreLabel     = t?.restoreLabel      ?? "復元";
  const foreverLabel     = t?.deleteForeverLabel ?? "完全に削除";

  if (!isExpanded) {
    // 折りたたみ時: バッジ付きゴミ箱アイコンのみ
    return (
      <button
        onClick={onToggleTrash}
        className="w-full flex justify-center py-2 text-neutral-400 hover:text-red-400 transition-colors relative"
        title={trashLabel}
      >
        <Trash2 className="w-4 h-4" />
        {trash.length > 0 && (
          <span className="absolute top-1 right-3.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold leading-none">
            {trash.length > 9 ? "9+" : trash.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700/60">
      {/* アコーディオンヘッダー */}
      <button
        onClick={onToggleTrash}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors duration-150"
      >
        <Trash2 className={`w-3.5 h-3.5 flex-none transition-colors ${trash.length > 0 ? "text-red-400" : "text-neutral-400"}`} />
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 flex-1 text-left">
          {trashLabel}
        </span>
        {trash.length > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold mr-1">
            {trash.length}
          </span>
        )}
        <motion.span animate={{ rotate: trashOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        </motion.span>
      </button>

      {/* アコーディオンコンテンツ */}
      <AnimatePresence initial={false}>
        {trashOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-200 dark:border-neutral-700/60 px-2 py-2 space-y-1 max-h-40 overflow-y-auto">
              {trash.length === 0 ? (
                <p className="text-xs text-neutral-400 px-2 py-1.5 italic text-center">
                  {trashEmptyLabel}
                </p>
              ) : (
                <AnimatePresence initial={false}>
                  {trash.map((item) => (
                    <motion.div key={item.id}
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <div className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/60 group">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate flex-1 min-w-0">
                          {item.question}
                        </span>
                        {/* 復元ボタン */}
                        <button
                          onClick={() => onRestore(item)}
                          title={restoreLabel}
                          className="flex-none w-6 h-6 flex items-center justify-center rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-neutral-400 hover:text-emerald-500 transition-all duration-150"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                        </button>
                        {/* 完全削除ボタン */}
                        <button
                          onClick={() => onDeleteForever(item)}
                          title={foreverLabel}
                          className="flex-none w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-400 hover:text-red-500 transition-all duration-150"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  フッターアイテム
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SidebarFooterItem({ icon, label, isExpanded }: { icon: React.ReactNode; label: string; isExpanded: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-100 ${!isExpanded ? "justify-center" : ""}`}>
      <span className="flex-none">{icon}</span>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="text-xs font-medium whitespace-nowrap overflow-hidden flex-1 text-left"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {isExpanded && <ChevronRight className="w-3 h-3 ml-auto opacity-40" />}
    </button>
  );
}
