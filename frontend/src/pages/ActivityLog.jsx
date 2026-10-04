import React, { useState, useEffect } from 'react';
import { activityService } from '../services/extraServices';
import { useToast } from '../context/ToastContext';
import { RoleBadge, LoadingSpinner } from '../components/BadgesAndCards';
import { formatDateTime } from '../utils/formatters';
import { History, Search, Filter, RefreshCw, Calendar } from 'lucide-react';

export const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const toast = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await activityService.getActivityLogs({
        search,
        action: actionFilter,
        date_from: dateFrom,
        date_to: dateTo,
      });
      setLogs(data.results ? data.results : data);
    } catch {
      toast.error('Failed to load activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, dateFrom, dateTo]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold font-serif-brand text-slate-100 flex items-center gap-2.5">
          <History className="w-6 h-6 text-amber-500" />
          <span>USER ACTIVITY LOG</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Immutable audit trail recording administrative modifications, operational actions, and record views.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action or details..."
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

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="CASE_CREATED">Case Created</option>
            <option value="CASE_VIEWED">Case Viewed</option>
            <option value="CASE_UPDATED">Case Updated</option>
            <option value="CASE_DELETED">Case Deleted</option>
            <option value="CASE_SEARCHED">Case Searched</option>
            <option value="USER_CREATED">User Created</option>
            <option value="USER_EDITED">User Edited</option>
            <option value="USER_ACTIVATED">User Activated</option>
            <option value="USER_DEACTIVATED">User Deactivated</option>
            <option value="PASSWORD_RESET">Password Reset</option>
            <option value="REPORT_DOWNLOADED">Report Downloaded</option>
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
            title="Start Date"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
            title="End Date"
          />

          <button
            onClick={() => {
              setSearch('');
              setActionFilter('');
              setDateFrom('');
              setDateTo('');
              fetchLogs();
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-700/80 rounded-xl transition"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" text="Fetching activity audit records..." />
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No activity log records match your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Related Record</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap font-mono">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100 whitespace-nowrap">
                      {log.username}
                    </td>
                    <td className="py-3 px-4">
                      <RoleBadge role={log.role} />
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-400/90 whitespace-nowrap">
                      {log.action_display || log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {log.related_record || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={log.details}>
                      {log.details || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {log.ip_address || '—'}
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
