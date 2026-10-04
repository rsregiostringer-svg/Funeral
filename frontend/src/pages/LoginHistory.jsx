import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { RoleBadge, LoadingSpinner } from '../components/BadgesAndCards';
import { formatDateTime } from '../utils/formatters';
import { LogIn, Search, Filter, RefreshCw, Monitor, Smartphone, Tablet } from 'lucide-react';

export const LoginHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useToast();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await userService.getLoginHistory({
        search,
        status: statusFilter,
      });
      setHistory(data.results ? data.results : data);
    } catch {
      toast.error('Failed to load login history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const getDeviceIcon = (device) => {
    const d = (device || '').toLowerCase();
    if (d.includes('mobile') || d.includes('phone')) return <Smartphone className="w-4 h-4 text-amber-400" />;
    if (d.includes('tablet')) return <Tablet className="w-4 h-4 text-purple-400" />;
    return <Monitor className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold font-serif-brand text-slate-100 flex items-center gap-2.5">
          <LogIn className="w-6 h-6 text-amber-500" />
          <span>LOGIN HISTORY</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Security audit of authentication attempts, IP origins, client devices, and session durations.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username, IP, browser..."
            className="w-full bg-slate-900 border border-slate-700/80 focus:border-amber-500 rounded-xl pl-9 pr-20 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="LOGGED_OUT">Logged Out</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              fetchHistory();
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-700/80 rounded-xl transition"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" text="Retrieving login security events..." />
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No login history records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">User Attempted</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Login Timestamp</th>
                  <th className="py-3 px-4">Logout Timestamp</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Browser & Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-100 whitespace-nowrap">
                      {item.username_attempted}
                    </td>
                    <td className="py-3 px-4">
                      <RoleBadge role={item.role} />
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap font-mono">
                      {formatDateTime(item.login_time)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono">
                      {item.logout_time ? formatDateTime(item.logout_time) : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap font-mono">
                      {formatDateTime(item.last_active)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          item.status === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : item.status === 'FAILED'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : 'bg-slate-700/50 text-slate-300 border-slate-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {item.ip_address || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(item.device)}
                        <span>{item.browser} ({item.device})</span>
                      </div>
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
