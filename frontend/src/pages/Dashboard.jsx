import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/extraServices';
import {
  MetricCard,
  LoadingSpinner,
  CaseStatusBadge,
  RoleBadge,
  StatusBadge,
} from '../components/BadgesAndCards';
import {
  ExecutiveBarChart,
  MonthlyCaseBarChart,
  ServiceDistributionDonut,
  UserPresenceGauge,
} from '../components/Charts';
import { formatDate, formatDateTime, formatCurrency } from '../utils/formatters';
import {
  LayoutDashboard,
  FileText,
  Users,
  Activity,
  Calendar,
  Clock,
  UserPlus,
  Plus,
  Search,
  ArrowRight,
  Shield,
  CheckCircle2,
  RefreshCw,
  DollarSign,
  TrendingUp,
  MapPin,
  Building,
  ShieldCheck,
  Smartphone,
  Monitor,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, isMasterAdmin, isAdmin, isStaff } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const stats = await dashboardService.getDashboardStats();
      setData(stats);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds for live monitoring
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading Alaala dashboard overview..." />;
  }

  const {
    case_metrics = {},
    user_metrics = {},
    charts = {},
    recent_cases = [],
    recent_activity = [],
    recent_logins = [],
    viewing_schedules = [],
  } = data || {};

  // =========================================================================
  // 1. MASTER ADMIN VIEW (Executive Command Center with Analytics & Charts)
  // =========================================================================
  if (isMasterAdmin) {
    return (
      <div className="space-y-8">
        {/* Master Admin Executive Banner */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-slate-950/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-xl shadow-amber-950/80 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif-brand text-slate-100">
                  Master Admin Executive Oversight
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  HIGHEST LEVEL
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Full-facility surveillance, business intelligence charts, user presence tracking, and system governance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-xl transition hover:border-slate-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>

            <Link
              to="/cases/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Funeral Case</span>
            </Link>
          </div>
        </div>

        {/* Master Admin Key Surveillance & Financial Metrics */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-wider font-bold text-amber-400 font-serif-brand flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Facility High-Level Key Performance Indicators</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <MetricCard
              title="Total Cases"
              value={case_metrics.total_cases ?? 0}
              subtitle="All cases recorded"
              icon={FileText}
              color="gold"
            />
            <MetricCard
              title="Active Cases"
              value={case_metrics.active_cases ?? 0}
              subtitle="In viewing / prep"
              icon={Activity}
              color="blue"
            />
            <MetricCard
              title="Cases Today"
              value={case_metrics.cases_today ?? 0}
              subtitle="Admitted today"
              icon={Calendar}
              color="purple"
            />
            <MetricCard
              title="Active Users"
              value={user_metrics.active_users ?? 0}
              subtitle="Online & interacting"
              icon={Users}
              color="emerald"
            />
            <MetricCard
              title="Idle Users"
              value={user_metrics.idle_users ?? 0}
              subtitle="Inactive > 3 mins"
              icon={Clock}
              color="gold"
            />
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(case_metrics.total_revenue || 0)}
              subtitle="Packages contracted"
              icon={DollarSign}
              color="slate"
            />
          </div>
        </section>

        {/* ================================================================= */}
        {/* CHARTS SECTION (MASTER ADMIN EXCLUSIVE)                           */}
        {/* ================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold font-serif-brand text-slate-100">
                Business Analytics & Case Trends
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Real-time calculations from database records
            </span>
          </div>

          {/* Grid of Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Interactive Executive Bar Chart (Spans 2 columns) */}
            <div className="lg:col-span-2">
              <ExecutiveBarChart
                monthlyData={charts.monthly_trends || []}
                serviceData={case_metrics.service_breakdown || []}
                statusData={case_metrics.status_breakdown || []}
                totalCases={case_metrics.total_cases || 0}
                totalRevenue={case_metrics.total_revenue || 0}
              />
            </div>

            {/* Chart 2: Real-Time User Presence Meter */}
            <div>
              <UserPresenceGauge userMetrics={user_metrics} />
            </div>
          </div>

          {/* Chart 3: Service Portfolio Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ServiceDistributionDonut data={case_metrics.service_breakdown || []} />

            {/* Case Status Distribution Card */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="pb-2 border-b border-slate-800/80">
                <h3 className="text-sm font-bold font-serif-brand text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Case Status Pipeline Overview</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Current operational stages across all recorded family cases
                </p>
              </div>

              <div className="space-y-2.5">
                {case_metrics.status_breakdown?.map((item) => (
                  <div
                    key={item.case_status}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                  >
                    <CaseStatusBadge status={item.case_status} />
                    <span className="font-bold text-slate-100 font-mono text-sm">
                      {item.count} cases
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Master Admin Bottom Grid: Recent Cases & Audit Feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3): Recent Cases Table */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold font-serif-brand text-slate-100">
                  Recent Case Admissions
                </h3>
                <p className="text-xs text-slate-400">
                  Recently opened memorial records and family contracts
                </p>
              </div>
              <Link to="/cases" className="text-xs font-semibold text-amber-400 hover:text-amber-300">
                View All Records →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Case No.</th>
                    <th className="py-2.5 px-3">Deceased Name</th>
                    <th className="py-2.5 px-3">Service</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Package Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recent_cases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-3 font-mono font-semibold text-amber-400">
                        <Link to={`/cases/${c.id}`} className="hover:underline">
                          {c.case_number}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-slate-200 font-medium">{c.deceased_name}</td>
                      <td className="py-3 px-3 text-slate-400">{c.service_type}</td>
                      <td className="py-3 px-3">
                        <CaseStatusBadge status={c.case_status} />
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-200 text-right">
                        {formatCurrency(c.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column (1/3): Security & Login Activity Stream */}
          <div className="space-y-6">
            {/* Recent Login Feed */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold font-serif-brand text-slate-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Recent Login Audits</span>
                </h3>
                <Link to="/login-history" className="text-xs text-amber-400 hover:text-amber-300">
                  All Logins →
                </Link>
              </div>

              <div className="space-y-2.5">
                {recent_logins.slice(0, 5).map((l) => (
                  <div key={l.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{l.username_attempted}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${l.status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                        {l.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                      <span>{l.browser} ({l.device})</span>
                      <span className="font-mono text-slate-500">{formatDateTime(l.login_time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity Logs */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold font-serif-brand text-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>System Activity Stream</span>
                </h3>
                <Link to="/activity-log" className="text-xs text-amber-400 hover:text-amber-300">
                  View Logs →
                </Link>
              </div>

              <div className="space-y-2">
                {recent_activity.slice(0, 5).map((act) => (
                  <div key={act.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold text-slate-200">{act.username}</span>
                      <span className="text-[10px]">{formatDateTime(act.created_at)}</span>
                    </div>
                    <div className="text-amber-400 font-medium mt-0.5">
                      {act.action_display || act.action}
                    </div>
                    {act.related_record && (
                      <div className="text-slate-400 text-[11px] truncate">{act.related_record}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. REGULAR ADMIN VIEW (Operational & Logistics Command - Distinct Layout)
  // =========================================================================
  if (isAdmin) {
    return (
      <div className="space-y-8">
        {/* Admin Operational Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold font-serif-brand text-slate-100">
                Administrative Operations & Chapel Desk
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                OPERATIONS ADMIN
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Welcome, <span className="font-semibold text-slate-200">{user?.full_name}</span>. Managing chapel occupancy, case intake, and operational logistics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDashboardData(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-xl transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span>Refresh</span>
            </button>

            <Link
              to="/cases/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Funeral Case</span>
            </Link>
          </div>
        </div>

        {/* Operational Metrics (No user surveillance metrics) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Cases Managed"
            value={case_metrics.total_cases ?? 0}
            subtitle="All active facility records"
            icon={FileText}
            color="gold"
          />
          <MetricCard
            title="Active Operational Cases"
            value={case_metrics.active_cases ?? 0}
            subtitle="In viewing / prep suites"
            icon={Activity}
            color="emerald"
          />
          <MetricCard
            title="Admissions Today"
            value={case_metrics.cases_today ?? 0}
            subtitle="New admissions"
            icon={Calendar}
            color="blue"
          />
          <MetricCard
            title="Completed Services"
            value={case_metrics.completed_cases ?? 0}
            subtitle="Interred or cremated"
            icon={CheckCircle2}
            color="purple"
          />
        </section>

        {/* Viewing Rooms & Chapel Schedules (Unique to Admin Operations) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold font-serif-brand text-slate-100 flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-400" />
                  <span>Chapel Occupancy & Scheduled Interments</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Current deceased in viewing rooms and upcoming burial / cremation timelines
                </p>
              </div>
              <Link to="/cases" className="text-xs font-semibold text-amber-400 hover:text-amber-300">
                All Cases →
              </Link>
            </div>

            {viewing_schedules.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs">
                No active viewing suites or upcoming interments currently scheduled.
              </div>
            ) : (
              <div className="space-y-3">
                {viewing_schedules.map((vs) => (
                  <div
                    key={vs.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">{vs.deceased_name}</span>
                        <span className="font-mono text-amber-400 font-semibold">({vs.case_number})</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          <span>{vs.chapel_room || 'Chapel Unassigned'}</span>
                        </span>
                        <span>•</span>
                        <span>{vs.service_type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CaseStatusBadge status={vs.case_status} />
                      <Link
                        to={`/cases/${vs.id}`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                      >
                        Dossier
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Operational Activity Stream */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold font-serif-brand text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Operational Team Activity</span>
            </h3>

            <div className="space-y-2.5">
              {recent_activity.slice(0, 6).map((item) => (
                <div key={item.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-semibold text-slate-200">{item.username}</span>
                    <span className="text-[10px]">{formatDateTime(item.created_at)}</span>
                  </div>
                  <div className="text-amber-400/90 font-medium mt-0.5">
                    {item.action_display || item.action}
                  </div>
                  {item.related_record && (
                    <div className="text-slate-400 text-[11px] truncate">{item.related_record}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. STAFF VIEW (Frontline Operations Desk)
  // =========================================================================
  return (
    <div className="space-y-8">
      {/* Staff Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-serif-brand text-slate-100">
            Funeral Operations Desk
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Welcome, <span className="font-semibold text-slate-200">{user?.full_name}</span>. Frontline case intake and family coordination.
          </p>
        </div>

        <Link
          to="/cases/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Funeral Case</span>
        </Link>
      </div>

      {/* Staff Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Cases Recorded"
          value={case_metrics.total_cases ?? 0}
          subtitle="System case archives"
          icon={FileText}
          color="gold"
        />
        <MetricCard
          title="Active Under Care"
          value={case_metrics.active_cases ?? 0}
          subtitle="Viewing & preparation"
          icon={Activity}
          color="emerald"
        />
        <MetricCard
          title="Admitted Today"
          value={case_metrics.cases_today ?? 0}
          subtitle="New family cases today"
          icon={Calendar}
          color="blue"
        />
      </div>

      {/* Quick Action Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold font-serif-brand text-slate-100">
            Need to register a new family or deceased?
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Manually enter the assigned Case Number (e.g., AFH-2026-0006) and complete the admission dossier.
          </p>
        </div>
        <Link
          to="/cases/new"
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition shrink-0"
        >
          Open Case Intake Form
        </Link>
      </div>

      {/* Recent Cases */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-serif-brand text-slate-100">
            Recent Case Admissions
          </h3>
          <Link to="/cases" className="text-xs font-semibold text-amber-400 hover:text-amber-300">
            All Cases →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Case Number</th>
                <th className="py-2.5 px-3">Deceased Name</th>
                <th className="py-2.5 px-3">Service Type</th>
                <th className="py-2.5 px-3">Chapel</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recent_cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 px-3 font-mono font-semibold text-amber-400">
                    <Link to={`/cases/${c.id}`} className="hover:underline">
                      {c.case_number}
                    </Link>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-100">{c.deceased_name}</td>
                  <td className="py-3 px-3 text-slate-300">{c.service_type}</td>
                  <td className="py-3 px-3 text-slate-400">{c.chapel_room || '—'}</td>
                  <td className="py-3 px-3">
                    <CaseStatusBadge status={c.case_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
