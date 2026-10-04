import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Users,
  DollarSign,
  Activity,
  Layers,
  ArrowUpDown,
  Calendar,
  Sparkles,
} from 'lucide-react';

/**
 * Executive Interactive Bar Chart Component
 * Supports multiple metric views (Case Volume, Revenue, Service Types, Status Pipeline)
 * with animated SVG/Tailwind bars, interactive hover tooltips, and sorting.
 */
export const ExecutiveBarChart = ({
  monthlyData = [],
  serviceData = [],
  statusData = [],
  totalCases = 0,
  totalRevenue = 0,
}) => {
  const [activeTab, setActiveTab] = useState('cases'); // 'cases' | 'revenue' | 'services' | 'status'
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [sortDescending, setSortDescending] = useState(false);

  // Fallback defaults if empty
  const defaultMonthly = [
    { label: 'May 2026', month_name: 'May', cases: 1, revenue: 85000 },
    { label: 'Jun 2026', month_name: 'June', cases: 2, revenue: 195000 },
    { label: 'Jul 2026', month_name: 'July', cases: 3, revenue: 290000 },
    { label: 'Aug 2026', month_name: 'August', cases: 2, revenue: 210000 },
    { label: 'Sep 2026', month_name: 'September', cases: 4, revenue: 420000 },
    { label: 'Oct 2026', month_name: 'October', cases: 5, revenue: 765000 },
  ];

  const effectiveMonthly = monthlyData.length > 0 ? monthlyData : defaultMonthly;

  // Process data based on active tab
  let displayBars = [];
  let isVertical = true;
  let metricLabel = 'Cases';
  let isCurrency = false;

  if (activeTab === 'cases') {
    isVertical = true;
    metricLabel = 'Cases Admitted';
    displayBars = [...effectiveMonthly].map((d) => ({
      key: d.label,
      label: d.month_name?.slice(0, 3) || d.label,
      fullLabel: d.label,
      value: d.cases,
      secondaryValue: formatCurrency(d.revenue),
      subtext: `${d.cases} admissions`,
    }));
  } else if (activeTab === 'revenue') {
    isVertical = true;
    metricLabel = 'Contracted Revenue (PHP)';
    isCurrency = true;
    displayBars = [...effectiveMonthly].map((d) => ({
      key: d.label,
      label: d.month_name?.slice(0, 3) || d.label,
      fullLabel: d.label,
      value: d.revenue,
      secondaryValue: `${d.cases} Cases`,
      subtext: formatCurrency(d.revenue),
    }));
  } else if (activeTab === 'services') {
    isVertical = false;
    metricLabel = 'Service Package Distribution';
    const totalServ = serviceData.reduce((acc, curr) => acc + curr.count, 0) || 1;
    displayBars = [...serviceData].map((s) => ({
      key: s.service_type,
      label: s.service_type,
      fullLabel: s.service_type,
      value: s.count,
      pct: Math.round((s.count / totalServ) * 100),
      secondaryValue: `${Math.round((s.count / totalServ) * 100)}% of total`,
      subtext: `${s.count} cases`,
    }));
  } else if (activeTab === 'status') {
    isVertical = false;
    metricLabel = 'Operational Status Pipeline';
    const totalStat = statusData.reduce((acc, curr) => acc + curr.count, 0) || 1;
    displayBars = [...statusData].map((st) => ({
      key: st.case_status,
      label: st.case_status.replace(/_/g, ' '),
      fullLabel: st.case_status.replace(/_/g, ' '),
      value: st.count,
      pct: Math.round((st.count / totalStat) * 100),
      secondaryValue: `${Math.round((st.count / totalStat) * 100)}% active`,
      subtext: `${st.count} cases`,
    }));
  }

  // Apply sorting if requested
  if (sortDescending) {
    displayBars.sort((a, b) => b.value - a.value);
  }

  const maxValue = Math.max(...displayBars.map((d) => d.value), isCurrency ? 50000 : 5);
  const peakItem = [...displayBars].sort((a, b) => b.value - a.value)[0];

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Chart Top Header & View Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif-brand text-slate-100 flex items-center gap-2">
                <span>Executive Case & Revenue Bar Chart</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  INTERACTIVE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Multi-metric facility performance analysis and distribution patterns
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls & Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Buttons */}
          <div className="inline-flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('cases');
                setHoveredIndex(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'cases'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Intake Volume
            </button>
            <button
              onClick={() => {
                setActiveTab('revenue');
                setHoveredIndex(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'revenue'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Revenue (₱)
            </button>
            <button
              onClick={() => {
                setActiveTab('services');
                setHoveredIndex(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'services'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Service Types
            </button>
          </div>

          {/* Sort Toggle */}
          <button
            onClick={() => setSortDescending(!sortDescending)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition ${
              sortDescending
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Sort by highest value"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{sortDescending ? 'Highest' : 'Default'}</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 1. VERTICAL BAR CHART (Monthly Admissions or Monthly Revenue)       */}
      {/* =================================================================== */}
      {isVertical ? (
        <div className="pt-2">
          {/* SVG Canvas Area */}
          <div className="h-64 w-full flex items-end justify-between gap-3 sm:gap-6 px-2 sm:px-6 relative">
            {/* Background Grid Horizontal Lines with Labels */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 pr-4">
              <div className="border-b border-slate-500 w-full flex justify-end text-[9px] font-mono text-slate-400 pr-1">
                {isCurrency ? formatCurrency(maxValue) : `${maxValue} max`}
              </div>
              <div className="border-b border-slate-500 w-full flex justify-end text-[9px] font-mono text-slate-400 pr-1">
                {isCurrency ? formatCurrency(Math.round(maxValue * 0.66)) : Math.round(maxValue * 0.66)}
              </div>
              <div className="border-b border-slate-500 w-full flex justify-end text-[9px] font-mono text-slate-400 pr-1">
                {isCurrency ? formatCurrency(Math.round(maxValue * 0.33)) : Math.round(maxValue * 0.33)}
              </div>
              <div className="border-b border-slate-500 w-full flex justify-end text-[9px] font-mono text-slate-400 pr-1">
                0
              </div>
            </div>

            {displayBars.map((item, idx) => {
              const heightPercent = Math.max(14, Math.round((item.value / maxValue) * 100));
              const isHovered = hoveredIndex === idx;
              const isPeak = peakItem?.key === item.key;

              return (
                <div
                  key={item.key || idx}
                  className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer z-10"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Floating Tooltip with Glassmorphism */}
                  {isHovered && (
                    <div className="absolute -top-16 bg-slate-900/95 backdrop-blur-md border border-amber-500/50 shadow-2xl rounded-2xl p-2.5 text-center pointer-events-none z-30 min-w-[130px] animate-in fade-in zoom-in-95 duration-150">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center justify-center gap-1">
                        {isPeak && <Sparkles className="w-3 h-3 text-amber-300" />}
                        <span>{item.fullLabel}</span>
                      </div>
                      <div className="text-sm font-bold text-white font-mono mt-0.5">
                        {isCurrency ? formatCurrency(item.value) : `${item.value} Cases`}
                      </div>
                      <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                        {item.secondaryValue}
                      </div>
                    </div>
                  )}

                  {/* Value Above Bar */}
                  <span
                    className={`text-[11px] font-mono mb-1.5 transition-all duration-200 ${
                      isHovered
                        ? 'text-amber-300 font-bold scale-110 -translate-y-1'
                        : isPeak
                        ? 'text-amber-400 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    {isCurrency ? `₱${Math.round(item.value / 1000)}k` : item.value}
                  </span>

                  {/* The Vertical Bar */}
                  <div className="w-full max-w-[54px] bg-slate-800/40 rounded-t-2xl overflow-hidden flex items-end p-0.5 border-t border-x border-slate-700/50">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 ease-out relative ${
                        isHovered
                          ? 'bg-gradient-to-t from-amber-600 via-amber-500 to-amber-300 shadow-lg shadow-amber-500/50 scale-[1.03]'
                          : isPeak
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-gradient-to-t from-amber-700/80 via-amber-600/70 to-amber-500/60'
                      }`}
                    >
                      {/* Subdued Inner Pillar Highlight Line */}
                      <div className="absolute inset-y-0 left-1 w-0.5 bg-white/20 rounded-full" />
                    </div>
                  </div>

                  {/* Month Label on X-Axis */}
                  <div className="mt-2.5 text-center">
                    <span
                      className={`text-[11px] font-bold tracking-wider uppercase transition ${
                        isHovered
                          ? 'text-amber-300 font-semibold'
                          : isPeak
                          ? 'text-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* =================================================================== */
        /* 2. HORIZONTAL BAR CHART (Service Breakdown or Status Pipeline)       */
        /* =================================================================== */
        <div className="space-y-3.5 pt-2">
          {displayBars.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No category data recorded.
            </div>
          ) : (
            displayBars.map((item, idx) => {
              const widthPercent = Math.max(8, Math.round((item.value / maxValue) * 100));
              const isHovered = hoveredIndex === idx;

              const colors = [
                { bar: 'from-amber-600 to-amber-400', text: 'text-amber-400' },
                { bar: 'from-blue-600 to-blue-400', text: 'text-blue-400' },
                { bar: 'from-purple-600 to-purple-400', text: 'text-purple-400' },
                { bar: 'from-emerald-600 to-emerald-400', text: 'text-emerald-400' },
                { bar: 'from-rose-600 to-rose-400', text: 'text-rose-400' },
                { bar: 'from-cyan-600 to-cyan-400', text: 'text-cyan-400' },
              ];
              const color = colors[idx % colors.length];

              return (
                <div
                  key={item.key || idx}
                  className="space-y-1.5 p-2 rounded-xl hover:bg-slate-900/60 transition cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${color.bar}`} />
                      <span>{item.label}</span>
                    </span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-400">{item.value} cases</span>
                      <span className={`font-bold ${color.text} min-w-[45px] text-right`}>
                        {item.pct}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar Track */}
                  <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      style={{ width: `${widthPercent}%` }}
                      className={`h-full rounded-full bg-gradient-to-r ${color.bar} transition-all duration-500 ${
                        isHovered ? 'shadow-lg shadow-amber-500/30 brightness-110' : ''
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. EXECUTIVE KPI MINI-RIBBON (Contextual Data Summary)              */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            TOTAL INTAKE
          </span>
          <span className="text-lg font-bold font-mono text-slate-100">
            {totalCases || effectiveMonthly.reduce((acc, c) => acc + c.cases, 0)} Cases
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
            PEAK MONTH
          </span>
          <span className="text-sm font-bold text-amber-300 font-mono truncate block mt-0.5">
            {peakItem?.fullLabel || 'October 2026'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
            TOTAL VOLUME
          </span>
          <span className="text-sm font-bold font-mono text-emerald-300 truncate block mt-0.5">
            {formatCurrency(totalRevenue || effectiveMonthly.reduce((acc, c) => acc + c.revenue, 0))}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
            AVG PACKAGE
          </span>
          <span className="text-sm font-bold font-mono text-cyan-300 truncate block mt-0.5">
            {formatCurrency(
              totalCases > 0
                ? totalRevenue / totalCases
                : 153000
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Standard Monthly Case Bar Chart (Vertical)
 */
export const MonthlyCaseBarChart = ({ data = [] }) => {
  return <ExecutiveBarChart monthlyData={data} />;
};

/**
 * Service Type Portfolio Breakdown
 */
export const ServiceDistributionDonut = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-500 text-xs h-64">
        No service distribution data recorded.
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.count, 0) || 1;

  const colorPalettes = [
    { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500' },
    { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500' },
    { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500' },
    { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500' },
    { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500' },
    { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500' },
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="pb-2 border-b border-slate-800/80">
        <h3 className="text-sm font-bold font-serif-brand text-slate-100 flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-amber-500" />
          <span>Service Type Portfolio Breakdown</span>
        </h3>
        <p className="text-xs text-slate-400">
          Distribution of funeral service packages selected by client families
        </p>
      </div>

      {/* Visual Stacked Progress Bar */}
      <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex gap-1 p-0.5 border border-slate-800">
        {data.map((item, idx) => {
          const pct = Math.round((item.count / total) * 100);
          const color = colorPalettes[idx % colorPalettes.length];
          return (
            <div
              key={idx}
              style={{ width: `${pct}%` }}
              title={`${item.service_type}: ${item.count} (${pct}%)`}
              className={`h-full rounded-full transition-all duration-500 ${color.bg}`}
            />
          );
        })}
      </div>

      {/* Legend with counts and percentages */}
      <div className="space-y-2.5 pt-2">
        {data.map((item, idx) => {
          const pct = Math.round((item.count / total) * 100);
          const color = colorPalettes[idx % colorPalettes.length];

          return (
            <div
              key={idx}
              className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/50 border border-slate-800/60"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                <span className="font-semibold text-slate-200">{item.service_type}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-400 font-medium">{item.count} cases</span>
                <span className={`font-mono font-bold ${color.text} min-w-[40px] text-right`}>
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Real-Time Staff Presence Meter
 */
export const UserPresenceGauge = ({ userMetrics = {} }) => {
  const { total_users = 0, active_users = 0, idle_users = 0, inactive_users = 0 } = userMetrics;
  const total = total_users || 1;

  const activePct = Math.round((active_users / total) * 100);
  const idlePct = Math.round((idle_users / total) * 100);
  const inactivePct = Math.round((inactive_users / total) * 100);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="pb-2 border-b border-slate-800/80">
        <h3 className="text-sm font-bold font-serif-brand text-slate-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Real-Time Staff Presence Meter</span>
        </h3>
        <p className="text-xs text-slate-400">
          Live surveillance distribution across all registered system accounts
        </p>
      </div>

      {/* Multi-segment Gauge Bar */}
      <div className="h-5 w-full bg-slate-900 rounded-full overflow-hidden flex gap-1 p-0.5 border border-slate-800">
        <div
          style={{ width: `${Math.max(activePct, 5)}%` }}
          className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-sm shadow-emerald-950"
          title={`Active: ${active_users} (${activePct}%)`}
        />
        <div
          style={{ width: `${Math.max(idlePct, idle_users > 0 ? 5 : 0)}%` }}
          className="h-full bg-amber-500 rounded-full transition-all duration-500 shadow-sm shadow-amber-950"
          title={`Idle: ${idle_users} (${idlePct}%)`}
        />
        <div
          style={{ width: `${Math.max(inactivePct, inactive_users > 0 ? 5 : 0)}%` }}
          className="h-full bg-rose-500/80 rounded-full transition-all duration-500 shadow-sm shadow-rose-950"
          title={`Inactive: ${inactive_users} (${inactivePct}%)`}
        />
      </div>

      {/* Breakdown Details */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-300 block">ACTIVE</span>
          <span className="text-lg font-bold font-mono text-emerald-400">{active_users}</span>
          <span className="text-[10px] text-emerald-500/90 block font-mono">{activePct}%</span>
        </div>
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-300 block">IDLE</span>
          <span className="text-lg font-bold font-mono text-amber-400">{idle_users}</span>
          <span className="text-[10px] text-amber-500/90 block font-mono">{idlePct}%</span>
        </div>
        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-center">
          <span className="text-[10px] uppercase font-bold text-rose-300 block">INACTIVE</span>
          <span className="text-lg font-bold font-mono text-rose-400">{inactive_users}</span>
          <span className="text-[10px] text-rose-500/90 block font-mono">{inactivePct}%</span>
        </div>
      </div>
    </div>
  );
};
