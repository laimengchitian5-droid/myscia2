"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart as RechartsPieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3, TrendingUp, Activity,
  PieChart as PieChartIcon, Hexagon, Layers,
} from "lucide-react";
import type { ChartDataPoint } from "@/app/types";
import type { Translations } from "@/app/lib/i18n/translations";

// ── 型定義 ────────────────────────────────────────────
type ChartType = "bar" | "line" | "area" | "pie" | "radar" | "composed";

interface StatChartProps {
  data: ChartDataPoint[];
  t: Translations;
  fullscreen?: boolean;  // フルスクリーンモード時 true → グラフ高さを拡大
}

// ── デザイントークン ──────────────────────────────────
const NEON = [
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#10b981", // emerald
  "#f43f5e", // rose
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
];

const AXIS_STYLE = { fill: "#9ca3af", fontSize: 11 };
const TOOLTIP_STYLE = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "10px",
  fontSize: "12px",
  color: "#f1f5f9",
  boxShadow: "0 8px 32px rgba(139,92,246,0.18)",
};
const GRID_STYLE = {
  stroke: "#334155",
  strokeOpacity: 0.4,
  strokeDasharray: "3 3",
};

// ── カスタム円グラフ引き出し線ラベル ─────────────────
const RADIAN = Math.PI / 180;

interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  percent: number;
  index: number;
  name: string;
}

function renderPieLabel({
  cx, cy, midAngle, outerRadius, percent, index, name,
}: PieLabelProps) {
  if (percent < 0.04) return null; // 4%未満はラベル非表示

  const sin    = Math.sin(-RADIAN * midAngle);
  const cos    = Math.cos(-RADIAN * midAngle);
  const sx     = cx + (outerRadius + 6)  * cos;
  const sy     = cy + (outerRadius + 6)  * sin;
  const mx     = cx + (outerRadius + 26) * cos;
  const my     = cy + (outerRadius + 26) * sin;
  const ex     = mx + (cos >= 0 ? 1 : -1) * 16;
  const ey     = my;
  const anchor = cos >= 0 ? "start" : "end";
  const color  = NEON[index % NEON.length];
  const label  = name.length > 9 ? `${name.slice(0, 9)}…` : name;
  const pct    = `${(percent * 100).toFixed(0)}%`;

  return (
    <g>
      <polyline
        points={`${sx},${sy} ${mx},${my} ${ex},${ey}`}
        stroke={color}
        strokeWidth={1.3}
        fill="none"
        opacity={0.75}
      />
      <circle cx={ex} cy={ey} r={2.5} fill={color} />
      <text
        x={ex + (cos >= 0 ? 5 : -5)}
        y={ey - 4}
        textAnchor={anchor}
        fill="#e2e8f0"
        fontSize={11}
        fontWeight={600}
      >
        {label}
      </text>
      <text
        x={ex + (cos >= 0 ? 5 : -5)}
        y={ey + 9}
        textAnchor={anchor}
        fill={color}
        fontSize={11}
        fontWeight={700}
      >
        {pct}
      </text>
    </g>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  メインコンポーネント
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function StatChart({ data, t, fullscreen = false }: StatChartProps) {
  const [chartType, setChartType] = useState<ChartType>("bar");

  if (!data || data.length === 0) return null;
  if (!t?.chartTypes) return null;

  // フルスクリーン時はグラフを大きく表示
  const H_NORMAL = 210;
  const H_PIE_NORMAL = 300;
  const H_RADAR_NORMAL = 240;
  const H      = fullscreen ? 460 : H_NORMAL;
  const H_PIE  = fullscreen ? 540 : H_PIE_NORMAL;
  const H_RADAR = fullscreen ? 480 : H_RADAR_NORMAL;

  const types: { key: ChartType; label: string; Icon: React.ElementType }[] = [
    { key: "bar",      label: t.chartTypes.bar,      Icon: BarChart3     },
    { key: "line",     label: t.chartTypes.line,     Icon: TrendingUp    },
    { key: "area",     label: t.chartTypes.area,     Icon: Activity      },
    { key: "pie",      label: t.chartTypes.pie,      Icon: PieChartIcon  },
    { key: "radar",    label: t.chartTypes.radar,    Icon: Hexagon       },
    { key: "composed", label: t.chartTypes.composed, Icon: Layers        },
  ];

  const isPie    = chartType === "pie";
  const isRadar  = chartType === "radar";

  return (
    <div className="w-full">
      {/* タイトル */}
      <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3">
        {t.chartTitle}
      </p>

      {/* ─── アイコン式グラフ切り替えタブ ─── */}
      <div className="grid grid-cols-6 gap-1 mb-4 p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/60">
        {types.map(({ key, label, Icon }) => {
          const active = chartType === key;
          return (
            <button
              key={key}
              onClick={() => setChartType(key)}
              title={label}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all duration-200 select-none ${
                active
                  ? "bg-white dark:bg-neutral-700 shadow-sm"
                  : "hover:bg-white/60 dark:hover:bg-neutral-700/50"
              }`}
              style={active ? { color: NEON[0] } : { color: "#9ca3af" }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="leading-tight truncate w-full text-center">{label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── グラフ本体（AnimatePresence で滑らかなタイプ切り替え） ─── */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={chartType}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {chartType === "bar"      && <BarChartView      data={data} height={H} />}
            {chartType === "line"     && <LineChartView     data={data} height={H} />}
            {chartType === "area"     && <AreaChartView     data={data} height={H} />}
            {chartType === "pie"      && <PieChartView      data={data} height={H_PIE} />}
            {chartType === "radar"    && <RadarChartView    data={data} height={H_RADAR} />}
            {chartType === "composed" && <ComposedChartView data={data} height={H} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── カスタム凡例（円・レーダー以外） ─── */}
      {!isPie && !isRadar && (
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-none"
                style={{ backgroundColor: NEON[i % NEON.length] }}
              />
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {item.name}:{" "}
                <strong className="text-neutral-700 dark:text-neutral-200">{item.value}</strong>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  1. 棒グラフ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function BarChartView({ data, height }: { data: ChartDataPoint[]; height: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 5, left: -10 }}>
        <defs>
          {data.map((_, i) => (
            <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={NEON[i % NEON.length]} stopOpacity={1}   />
              <stop offset="100%" stopColor={NEON[i % NEON.length]} stopOpacity={0.5} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid {...GRID_STYLE} />
        <XAxis dataKey="name" tick={AXIS_STYLE} />
        <YAxis domain={[0, 100]} tick={AXIS_STYLE} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}`, ""]} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={800} isAnimationActive>
          {data.map((_, i) => (
            <Cell key={i} fill={`url(#barGrad${i})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  2. 折れ線グラフ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LineChartView({ data, height }: { data: ChartDataPoint[]; height: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 5, left: -10 }}>
        <defs>
          <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID_STYLE} />
        <XAxis dataKey="name" tick={AXIS_STYLE} />
        <YAxis domain={[0, 100]} tick={AXIS_STYLE} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}`, ""]} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="url(#lineGlow)"
          strokeWidth={3}
          dot={({ cx, cy, index }) => (
            <circle
              key={`dot-${index}`}
              cx={cx} cy={cy} r={4.5}
              fill={NEON[index % NEON.length]}
              stroke="#0f172a"
              strokeWidth={2}
            />
          )}
          activeDot={{ r: 7, fill: "#06b6d4", stroke: "#0f172a", strokeWidth: 2 }}
          isAnimationActive
          animationDuration={800}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  3. エリアグラフ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AreaChartView({ data, height }: { data: ChartDataPoint[]; height: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 5, left: -10 }}>
        <defs>
          <linearGradient id="areaGradFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#8b5cf6" stopOpacity={0.55} />
            <stop offset="60%"  stopColor="#06b6d4" stopOpacity={0.2}  />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="areaGradStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID_STYLE} />
        <XAxis dataKey="name" tick={AXIS_STYLE} />
        <YAxis domain={[0, 100]} tick={AXIS_STYLE} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}`, ""]} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="url(#areaGradStroke)"
          strokeWidth={2.5}
          fill="url(#areaGradFill)"
          dot={{ fill: "#8b5cf6", r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: "#06b6d4", stroke: "#0f172a", strokeWidth: 2 }}
          isAnimationActive
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  4. 円グラフ（引き出し線付きカスタムラベル）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function PieChartView({ data, height }: { data: ChartDataPoint[]; height: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <defs>
          {data.map((_, i) => (
            <radialGradient key={i} id={`pieGrad${i}`} cx="50%" cy="30%">
              <stop offset="0%"   stopColor={NEON[i % NEON.length]} stopOpacity={1}   />
              <stop offset="100%" stopColor={NEON[i % NEON.length]} stopOpacity={0.65} />
            </radialGradient>
          ))}
        </defs>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="48%"
          outerRadius={82}
          innerRadius={32}
          paddingAngle={3}
          isAnimationActive
          animationDuration={800}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label={(props: any) => renderPieLabel(props as PieLabelProps)}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={`url(#pieGrad${i})`}
              stroke="#0f172a"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v) => [`${v}`, ""]}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  5. レーダーチャート（クモの巣グラフ）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function RadarChartView({ data, height }: { data: ChartDataPoint[]; height: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <defs>
          <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#8b5cf6" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2}  />
          </linearGradient>
        </defs>
        <PolarGrid
          stroke="#334155"
          strokeOpacity={0.5}
        />
        <PolarAngleAxis
          dataKey="name"
          tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 500 }}
        />
        <PolarRadiusAxis
          domain={[0, 100]}
          tick={{ fill: "#64748b", fontSize: 9 }}
          tickCount={4}
          axisLine={false}
        />
        <Radar
          dataKey="value"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="url(#radarFill)"
          dot={{ fill: "#8b5cf6", r: 3.5, strokeWidth: 0 }}
          isAnimationActive
          animationDuration={800}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v) => [`${v}`, ""]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  6. 複合グラフ（棒 + 折れ線）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ComposedChartView({ data, height }: { data: ChartDataPoint[]; height: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 5, left: -10 }}>
        <defs>
          {data.map((_, i) => (
            <linearGradient key={i} id={`compBarGrad${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={NEON[i % NEON.length]} stopOpacity={0.9} />
              <stop offset="100%" stopColor={NEON[i % NEON.length]} stopOpacity={0.4} />
            </linearGradient>
          ))}
          <linearGradient id="compLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID_STYLE} />
        <XAxis dataKey="name" tick={AXIS_STYLE} />
        <YAxis domain={[0, 100]} tick={AXIS_STYLE} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}`, ""]} />
        {/* 棒グラフ（グラデーション・半透明） */}
        <Bar
          dataKey="value"
          radius={[5, 5, 0, 0]}
          isAnimationActive
          animationDuration={600}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={`url(#compBarGrad${i})`} />
          ))}
        </Bar>
        {/* 折れ線（トレンドライン） */}
        <Line
          type="monotone"
          dataKey="value"
          stroke="url(#compLineGrad)"
          strokeWidth={2.5}
          dot={{ fill: "#f59e0b", r: 4, stroke: "#0f172a", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "#f43f5e", stroke: "#0f172a", strokeWidth: 2 }}
          isAnimationActive
          animationDuration={800}
          animationBegin={400}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
