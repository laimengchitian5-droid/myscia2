"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Code2 } from "lucide-react";
import type { CodeArtifact, CodeLanguage } from "@/app/types";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ライトウェイト構文ハイライター（外部依存なし）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const KEYWORDS: Partial<Record<CodeLanguage, Set<string>>> = {
  python: new Set([
    "import","from","def","class","return","if","else","elif","for","while",
    "in","not","and","or","True","False","None","with","as","try","except",
    "finally","raise","pass","break","continue","lambda","yield","global",
    "nonlocal","del","assert","async","await","is",
  ]),
  r: new Set([
    "function","return","if","else","for","while","in","TRUE","FALSE","NULL",
    "NA","library","require","print","cat","c","list",
  ]),
  javascript: new Set([
    "import","export","from","const","let","var","function","return","if",
    "else","for","while","of","class","extends","new","this","true","false",
    "null","undefined","async","await","try","catch","finally","throw",
    "typeof","instanceof","switch","case","break","default",
  ]),
};

const BUILTINS: Partial<Record<CodeLanguage, Set<string>>> = {
  python: new Set([
    "print","len","range","list","dict","set","tuple","str","int","float",
    "bool","type","isinstance","enumerate","zip","map","filter","sorted",
    "sum","min","max","abs","round","open","np","pd","plt","scipy","sklearn",
  ]),
  r: new Set([
    "c","data.frame","read.csv","write.csv","lm","glm","ggplot","aes",
    "geom_point","geom_bar","mean","sd","cor","t.test","summary","head","tail",
  ]),
  javascript: new Set([
    "console","Math","Array","Object","String","Number","JSON","Promise",
    "fetch","setTimeout","setInterval","document","window","process",
  ]),
};

const COMMENT_CHAR: Partial<Record<CodeLanguage, string>> = {
  python: "#", r: "#", javascript: "//",
};

interface Token { type: "keyword" | "builtin" | "string" | "comment" | "number" | "plain"; value: string }

function tokenizeLine(line: string, lang: CodeLanguage): Token[] {
  if (lang === "markdown") {
    if (/^#{1,6}\s/.test(line)) return [{ type: "keyword", value: line }];
    if (/^```/.test(line))       return [{ type: "comment", value: line }];
    if (/^[-*]\s/.test(line))    return [{ type: "builtin", value: line }];
    return [{ type: "plain", value: line }];
  }
  if (lang === "text") return [{ type: "plain", value: line }];

  const tokens: Token[] = [];
  let rem = line;
  const kw = KEYWORDS[lang] ?? new Set<string>();
  const bl = BUILTINS[lang] ?? new Set<string>();
  const cc = COMMENT_CHAR[lang] ?? "#";

  while (rem.length > 0) {
    // Comment
    if (rem.startsWith(cc)) { tokens.push({ type: "comment", value: rem }); break; }
    // String (single / double quote)
    if (rem[0] === '"' || rem[0] === "'") {
      const q = rem[0]; let i = 1;
      while (i < rem.length && rem[i] !== q) { if (rem[i] === "\\") i++; i++; }
      tokens.push({ type: "string", value: rem.slice(0, i + 1) });
      rem = rem.slice(i + 1); continue;
    }
    // Number
    const numM = rem.match(/^(\d+\.?\d*)/);
    if (numM) { tokens.push({ type: "number", value: numM[0] }); rem = rem.slice(numM[0].length); continue; }
    // Word
    const wordM = rem.match(/^([A-Za-z_]\w*\.?[A-Za-z_]\w*|[A-Za-z_]\w*)/);
    if (wordM) {
      const w = wordM[0];
      const base = w.split(".")[0];
      tokens.push({
        type: kw.has(base) ? "keyword" : bl.has(base) ? "builtin" : "plain",
        value: w,
      });
      rem = rem.slice(w.length); continue;
    }
    // Other
    tokens.push({ type: "plain", value: rem[0] }); rem = rem.slice(1);
  }
  return tokens;
}

const TOKEN_COLOR: Record<Token["type"], string> = {
  keyword: "text-violet-400 font-semibold",
  builtin: "text-cyan-400",
  string:  "text-emerald-400",
  comment: "text-neutral-500 italic",
  number:  "text-amber-400",
  plain:   "text-neutral-200",
};

function SyntaxLine({ line, lang }: { line: string; lang: CodeLanguage }) {
  if (line === "") return <>&nbsp;</>;
  return (
    <>
      {tokenizeLine(line, lang).map((tok, i) => (
        <span key={i} className={TOKEN_COLOR[tok.type]}>{tok.value}</span>
      ))}
    </>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  メインパネルコンポーネント
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface CodeArtifactPanelProps {
  artifact: CodeArtifact;
  onClose: () => void;
}

export function CodeArtifactPanel({ artifact, onClose }: CodeArtifactPanelProps) {
  const [copied, setCopied] = useState(false);

  // Esc キーで閉じる
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(artifact.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* サイレント */ }
  }, [artifact.code]);

  const lines = artifact.code.split(/\\n|\n/);

  return (
    <AnimatePresence>
      {/* モバイルバックドロップ */}
      <motion.div
        key="artifact-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-[145] md:hidden"
      />

      {/* メインパネル */}
      <motion.div
        key="artifact-panel"
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed right-0 top-0 h-screen z-[150] w-full md:w-[480px] lg:w-[520px] bg-neutral-950 border-l border-neutral-800 shadow-2xl shadow-black/60 flex flex-col"
      >
        {/* ─── タイトルバー（macOS風） ─── */}
        <div className="flex-none flex items-center gap-3 px-5 py-3.5 bg-neutral-900 border-b border-neutral-800">
          {/* Traffic light */}
          <button onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors flex-none"
            aria-label="閉じる"
          />
          <div className="w-3 h-3 rounded-full bg-amber-500 flex-none opacity-60" />
          <div className="w-3 h-3 rounded-full bg-emerald-500 flex-none opacity-60" />

          <span className="flex-1 text-center text-xs font-mono text-neutral-400 truncate">
            {artifact.title}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-violet-400 uppercase tracking-wide">
              {artifact.language}
            </span>
            <button
              onClick={handleCopy}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150 ${
                copied
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-neutral-500 hover:text-white hover:bg-neutral-800"
              }`}
              title="コードをコピー"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all duration-150 md:hidden"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ─── コードエリア ─── */}
        <div className="flex-1 overflow-y-auto">
          <pre className="font-mono text-sm leading-6 p-0 bg-transparent">
            {lines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.012, duration: 0.12 }}
                className="flex hover:bg-white/[0.03] px-5 transition-colors duration-75"
              >
                <span className="text-neutral-700 select-none w-7 flex-none text-right mr-5 text-xs leading-6 font-mono">
                  {i + 1}
                </span>
                <span className="flex-1 whitespace-pre min-w-0">
                  <SyntaxLine line={line} lang={artifact.language} />
                </span>
              </motion.div>
            ))}
          </pre>
        </div>

        {/* ─── 説明フッター ─── */}
        {artifact.description && (
          <div className="flex-none border-t border-neutral-800 bg-neutral-900/80 px-5 py-3">
            <p className="text-xs text-neutral-400 leading-relaxed">
              <span className="text-cyan-500 font-semibold mr-1.5">💡</span>
              {artifact.description}
            </p>
          </div>
        )}

        {/* 著作権 */}
        <div className="flex-none border-t border-neutral-800 py-2 text-center">
          <p className="text-[9px] text-neutral-700 font-mono">
            scia-nexus® Code Artifact Viewer
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  インライントリガーボタン（ResultPanel に埋め込む）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface CodeArtifactButtonProps {
  artifact: NonNullable<CodeArtifact>;
  onClick: () => void;
}

export function CodeArtifactButton({ artifact, onClick }: CodeArtifactButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-violet-500/60 hover:bg-neutral-800 transition-all duration-200 group"
    >
      {/* macOS traffic dots (mini) */}
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-red-500/80" />
        <span className="w-2 h-2 rounded-full bg-amber-500/80" />
        <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
      </div>
      <Code2 className="w-3.5 h-3.5 text-violet-400 group-hover:text-violet-300 transition-colors" />
      <span className="text-xs font-mono text-neutral-300 group-hover:text-white transition-colors">
        {artifact.title}
      </span>
      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-violet-400 uppercase">
        {artifact.language}
      </span>
    </motion.button>
  );
}
