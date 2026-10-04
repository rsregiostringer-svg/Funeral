export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₱0.00';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const getRoleBadge = (role) => {
  switch (role) {
    case 'MASTER_ADMIN':
      return {
        label: 'MASTER ADMIN',
        className: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        dot: 'bg-amber-400',
      };
    case 'ADMIN':
      return {
        label: 'ADMIN',
        className: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        dot: 'bg-indigo-400',
      };
    case 'STAFF':
      return {
        label: 'STAFF',
        className: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
        dot: 'bg-slate-400',
      };
    default:
      return {
        label: role || 'UNKNOWN',
        className: 'bg-slate-700 text-slate-300 border-slate-600',
        dot: 'bg-slate-400',
      };
  }
};

export const getStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return {
        label: 'ACTIVE',
        className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        dot: 'bg-emerald-400 animate-pulse',
      };
    case 'IDLE':
      return {
        label: 'IDLE',
        className: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        dot: 'bg-amber-400',
      };
    case 'INACTIVE':
      return {
        label: 'INACTIVE',
        className: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        dot: 'bg-rose-400',
      };
    default:
      return {
        label: status || 'UNKNOWN',
        className: 'bg-slate-700 text-slate-400 border-slate-600',
        dot: 'bg-slate-400',
      };
  }
};

export const getCaseStatusBadge = (status) => {
  switch (status) {
    case 'PENDING_EMBALMING':
      return {
        label: 'Pending Embalming',
        className: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      };
    case 'IN_VIEWING':
      return {
        label: 'In Viewing / Chapel',
        className: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      };
    case 'SCHEDULED_FOR_BURIAL':
      return {
        label: 'Scheduled for Burial',
        className: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      };
    case 'SCHEDULED_FOR_CREMATION':
      return {
        label: 'Scheduled for Cremation',
        className: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        className: 'bg-slate-500/15 text-slate-400 border-slate-600',
      };
    default:
      return {
        label: status || 'Unknown',
        className: 'bg-slate-700 text-slate-300 border-slate-600',
      };
  }
};

/**
 * Capitalizes the first letter of each word (e.g. 'dela cruz' -> 'Dela Cruz', 'juan' -> 'Juan')
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(/(?:^|\s|-)[a-z]/g, (match) => match.toUpperCase());
};

/**
 * Formats name as: Last Name, First Name Middle Name (e.g. 'Dela Cruz, Juan Santos')
 */
export const formatFullName = (last, first, middle) => {
  const l = capitalizeWords(last?.trim());
  const f = capitalizeWords(first?.trim());
  const m = capitalizeWords(middle?.trim());
  if (!l && !f) return '';
  const prefix = [l, f].filter(Boolean).join(', ');
  return m ? `${prefix} ${m}` : prefix;
};

