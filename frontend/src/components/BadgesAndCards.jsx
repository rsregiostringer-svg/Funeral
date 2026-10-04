import React from 'react';
import { getStatusBadge, getRoleBadge, getCaseStatusBadge } from '../utils/formatters';

export const StatusBadge = ({ status }) => {
  const badge = getStatusBadge(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
      {badge.label}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const badge = getRoleBadge(role);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
      {badge.label}
    </span>
  );
};

export const CaseStatusBadge = ({ status }) => {
  const badge = getCaseStatusBadge(status);
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
      {badge.label}
    </span>
  );
};

export const LoadingSpinner = ({ size = 'md', text = 'Loading data...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
      <div className={`${sizeClasses[size] || sizeClasses.md} border-amber-500/20 border-t-amber-500 rounded-full animate-spin`} />
      {text && <p className="mt-3 text-sm font-medium text-slate-400">{text}</p>}
    </div>
  );
};

export const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'gold', trend }) => {
  const colorStyles = {
    gold: 'border-amber-500/20 hover:border-amber-500/40 text-amber-400 bg-amber-500/10',
    blue: 'border-blue-500/20 hover:border-blue-500/40 text-blue-400 bg-blue-500/10',
    emerald: 'border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    purple: 'border-purple-500/20 hover:border-purple-500/40 text-purple-400 bg-purple-500/10',
    rose: 'border-rose-500/20 hover:border-rose-500/40 text-rose-400 bg-rose-500/10',
    slate: 'border-slate-700 hover:border-slate-600 text-slate-300 bg-slate-800/40',
  };

  return (
    <div className="glass-panel p-5 rounded-2xl transition hover:shadow-xl hover:translate-y-[-2px] duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorStyles[color] || colorStyles.gold}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold font-serif-brand text-slate-100">
          {value !== undefined ? value : '—'}
        </span>
        {trend && (
          <span className="text-xs font-medium text-emerald-400">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-400 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
