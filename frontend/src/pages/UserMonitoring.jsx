import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { StatusBadge, RoleBadge, LoadingSpinner } from '../components/BadgesAndCards';
import { formatDateTime } from '../utils/formatters';
import { Activity, Clock, Users, Shield, RefreshCw } from 'lucide-react';

export const UserMonitoring = () => {
  const [data, setData] = useState({ users: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const toast = useToast();

  const fetchMonitoringData = async (showToast = false) => {
    try {
      const res = await userService.getMonitoring();
      setData(res);
      setLastUpdated(new Date());
      if (showToast) {
        toast.info('User surveillance refreshed.');
      }
    } catch {
      // Avoid spamming error toasts on background polling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    // Auto-polling every 10 seconds for real-time live monitoring
    const timer = setInterval(() => {
      fetchMonitoringData();
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const { counts = {}, users = [] } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-serif-brand text-slate-100 flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-amber-500 animate-pulse" />
              <span>USER MONITORING</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              LIVE (10s POLL)
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time presence tracking, session activity states, and idle detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 font-mono">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={() => fetchMonitoringData(true)}
            className="p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-xl transition"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Status Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Total Accounts
            </span>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-3 text-3xl font-bold font-serif-brand text-slate-100">
            {counts.TOTAL ?? 0}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            System registered users
          </p>
        </div>

        {/* Active Users */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-emerald-300 tracking-wider">
              Active Users
            </span>
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="mt-3 text-3xl font-bold font-serif-brand text-emerald-300">
            {counts.ACTIVE ?? 0}
          </div>
          <p className="mt-1 text-xs text-emerald-400/80">
            Interacting within last 3 mins
          </p>
        </div>

        {/* Idle Users */}
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-amber-300 tracking-wider">
              Idle Users
            </span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3 text-3xl font-bold font-serif-brand text-amber-300">
            {counts.IDLE ?? 0}
          </div>
          <p className="mt-1 text-xs text-amber-400/80">
            No activity for 3–15 mins
          </p>
        </div>

        {/* Inactive Users */}
        <div className="glass-panel p-5 rounded-2xl border border-rose-500/20 bg-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-rose-300 tracking-wider">
              Inactive Users
            </span>
            <Shield className="w-5 h-5 text-rose-400" />
          </div>
          <div className="mt-3 text-3xl font-bold font-serif-brand text-rose-300">
            {counts.INACTIVE ?? 0}
          </div>
          <p className="mt-1 text-xs text-rose-400/80">
            Logged out or offline &gt; 15 mins
          </p>
        </div>
      </div>

      {/* Monitoring Table */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" text="Connecting to monitoring stream..." />
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No active or monitored users recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Real-Time Status</th>
                  <th className="py-3 px-4">Login Time</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4">Logout Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{u.full_name}</div>
                      <div className="text-[11px] font-mono text-amber-400/80">@{u.username}</div>
                    </td>
                    <td className="py-3 px-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={u.computed_status} />
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {formatDateTime(u.latest_login_time)}
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {formatDateTime(u.last_active)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {u.latest_logout_time ? formatDateTime(u.latest_logout_time) : 'Active Session'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
