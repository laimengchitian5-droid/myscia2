"use client";

import { BookOpen, BarChart2, GraduationCap, Briefcase } from "lucide-react";
import type { AgeGroup } from "@/app/types";
import type { Translations } from "@/app/lib/i18n/translations";

// 内部インデックス: 0〜3 = 学生, 4〜6 = 社会人
const STUDENT_COUNT = 4;

interface OptionTogglesProps {
  userTypeIdx: number;
  userTypeLabels: [string, string, string, string];
  proUserTypeLabels: [string, string, string];
  ageGroup: AgeGroup;
  showSources: boolean;
  showChart: boolean;
  onUserTypeChange: (idx: number) => void;
  onAgeGroupChange: (v: AgeGroup) => void;
  onShowSourcesChange: (v: boolean) => void;
  onShowChartChange: (v: boolean) => void;
  t: Translations;
}

export function OptionToggles({
  userTypeIdx,
  userTypeLabels,
  proUserTypeLabels,
  ageGroup,
  showSources,
  showChart,
  onUserTypeChange,
  onAgeGroupChange,
  onShowSourcesChange,
  onShowChartChange,
  t,
}: OptionTogglesProps) {
  return (
    <div className="space-y-4">
      {/* ── 学生セクション ── */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <GraduationCap className="w-3.5 h-3.5 text-neutral-400" />
          <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            {t.studentGroupLabel}
          </label>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {(userTypeLabels ?? []).map((label, idx) => (
            <UserTypeButton
              key={idx}
              label={label}
              active={userTypeIdx === idx}
              onClick={() => onUserTypeChange(idx)}
              color="violet"
            />
          ))}
        </div>
      </div>

      {/* ── 社会人セクション ── */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
          <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            {t?.professionalGroupLabel}
          </label>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {(proUserTypeLabels ?? []).map((label, idx) => (
            <UserTypeButton
              key={idx}
              label={label}
              active={userTypeIdx === STUDENT_COUNT + idx}
              onClick={() => onUserTypeChange(STUDENT_COUNT + idx)}
              color="cyan"
            />
          ))}
        </div>
      </div>

      {/* ── 年齢層セレクタ ── */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
          {t?.ageGroupLabel}
        </label>
        <select
          value={ageGroup}
          onChange={(e) => onAgeGroupChange(e.target.value as AgeGroup)}
          className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all duration-150 cursor-pointer"
        >
          {(t?.ageGroupOptions ?? []).map((opt) => (
            <option key={opt} value={toInternalAgeGroup(opt, t?.ageGroupOptions ?? [])}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* ── トグル群 ── */}
      <div className="space-y-2">
        <ToggleRow
          icon={<BookOpen className="w-3.5 h-3.5" />}
          label={t.showSourcesLabel}
          description={t.showSourcesDesc}
          enabled={showSources}
          onToggle={() => onShowSourcesChange(!showSources)}
        />
        <ToggleRow
          icon={<BarChart2 className="w-3.5 h-3.5" />}
          label={t.showChartLabel}
          description={t.showChartDesc}
          enabled={showChart}
          onToggle={() => onShowChartChange(!showChart)}
        />
      </div>
    </div>
  );
}

// 言語表示ラベル → 内部の日本語 AgeGroup 値への変換
// 日本語以外の言語では select の value に日本語キーを使う
const JA_AGE_GROUP_VALUES: AgeGroup[] = [
  "指定なし", "15〜19歳", "20〜24歳", "25〜29歳", "30〜34歳",
  "35〜39歳", "40〜44歳", "45〜49歳", "50代", "60代以上",
];

function toInternalAgeGroup(displayLabel: string, options: string[]): AgeGroup {
  const idx = options.indexOf(displayLabel);
  return idx >= 0 ? JA_AGE_GROUP_VALUES[idx] : "指定なし";
}

// ── サブコンポーネント ──
function UserTypeButton({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color: "violet" | "cyan";
}) {
  const activeClass =
    color === "violet"
      ? "bg-violet-500 text-white shadow-md shadow-violet-500/30"
      : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20";

  return (
    <button
      onClick={onClick}
      className={`py-1.5 px-2 rounded-lg text-sm font-medium transition-all duration-150 ${
        active
          ? activeClass
          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
      }`}
    >
      {label}
    </button>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-150"
    >
      <span className={`flex-none ${enabled ? "text-violet-500" : "text-neutral-400"}`}>{icon}</span>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-none">{label}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{description}</p>
      </div>
      <div
        className={`w-10 h-5 rounded-full transition-all duration-200 relative flex-none ${
          enabled ? "bg-violet-500" : "bg-neutral-300 dark:bg-neutral-600"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
            enabled ? "left-[22px]" : "left-0.5"
          }`}
        />
      </div>
    </button>
  );
}
