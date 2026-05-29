"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, FlaskConical } from "lucide-react";
import { ResultPanel } from "../results/ResultPanel";
import type { ChatThread } from "@/app/types/chat";
import type { Translations } from "@/app/lib/i18n/translations";

interface MessageLogProps {
  thread: ChatThread;
  isLoading: boolean;
  t: Translations;
}

export function MessageLog({ thread, isLoading, t }: MessageLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // 新メッセージ到着・ロード状態変化でスクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.messages.length, isLoading]);

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-10">
      <AnimatePresence initial={false}>
        {thread.messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            {msg.role === "user" ? (
              /* ── ユーザーバブル ── */
              <div className="flex justify-end">
                <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-br-md bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-md shadow-violet-500/20">
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            ) : (
              /* ── AIレスポンス ── */
              <div className="space-y-3">
                {/* ラベル行 */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 flex items-center justify-center flex-none shadow-md shadow-violet-500/30">
                    <FlaskConical className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    SciaSource AI
                  </span>
                  <span className="text-[10px] text-neutral-300 dark:text-neutral-600">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* 結果パネル or フォールバックテキスト */}
                {msg.jsonData ? (
                  <ResultPanel data={msg.jsonData} t={t} />
                ) : (
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {msg.content}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ローディングスケルトン */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm"
        >
          <Loader2 className="w-4 h-4 text-violet-500 animate-spin flex-none" />
          <div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              {t?.loadingTitle ?? "AIが解析中..."}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">
              {t?.loadingDesc ?? "Groq LLM が最適な研究アプローチを判定しています"}
            </p>
          </div>
          {/* ドットアニメーション */}
          <div className="flex gap-1 ml-auto">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
