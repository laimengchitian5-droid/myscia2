"use client";

import { Moon, Sun } from "lucide-react";
import type { Translations } from "@/app/lib/i18n/translations";

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  t: Translations;
}

export function Header({ isDark, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200/70 dark:border-neutral-800/70 backdrop-blur-md bg-white/80 dark:bg-neutral-950/80 flex-none">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-end">
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
          aria-label="テーマ切り替え"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
