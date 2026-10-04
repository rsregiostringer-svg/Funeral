import React, { useState, useEffect } from 'react';
import { reportService } from '../services/extraServices';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner, MetricCard, CaseStatusBadge } from '../components/BadgesAndCards';
import { formatDate, formatCurrency } from '../utils/formatters';
import {
  Download,
  Printer,
  Calendar,
  Filter,
  RefreshCw,
  FileText,
  DollarSign,
  PieChart,
} from 'lucide-react';

export const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const toast = useToast();

  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    case_status: '',
    service_type: '',
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportService.getReportOverview(filters);
      setReportData(data);
    } catch {
      toast.error('Failed to generate report overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters.case_status, filters.service_type]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyDateFilters = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handleDownloadCSV = async () => {
    setDownloading(true);
    try {
      await reportService.downloadReportCSV(filters);
      toast.success('Report downloaded successfully.');
    } catch {
      toast.error('Failed to download report.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800 print:hidden">
        <div>
          <h1 className="text-2xl font-bold font-serif-brand text-slate-100 flex items-center gap-2.5">
            <Download className="w-6 h-6 text-amber-500" />
            <span>EXECUTIVE REPORTS & EXPORT</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Operational summaries, service distribution, case status breakdowns, and CSV export.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-xl transition"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'EXPORTING CSV...' : 'DOWNLOAD CSV'}</span>
          </button>
        </div>
      </div>

      {/* Filter Controls (Hidden during print) */}
      <form
        onSubmit={handleApplyDateFilters}
        className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex flex-wrap gap-3 items-center justify-between print:hidden"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Passing Date From:</span>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">To:</span>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Apply Dates
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            name="case_status"
            value={filters.case_status}
            onChange={handleFilterChange}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PENDING_EMBALMING">Pending Embalming</option>
            <option value="IN_VIEWING">In Viewing / Chapel</option>
            <option value="SCHEDULED_FOR_BURIAL">Scheduled for Burial</option>
            <option value="SCHEDULED_FOR_CREMATION">Scheduled for Cremation</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            name="service_type"
            value={filters.service_type}
            onChange={handleFilterChange}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Services</option>
            <option value="Traditional Burial">Traditional Burial</option>
            <option value="Direct Cremation">Direct Cremation</option>
            <option value="Cremation with Viewing">Cremation with Viewing</option>
            <option value="Memorial Service">Memorial Service</option>
            <option value="Repatriation">Repatriation</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setFilters({
                start_date: '',
                end_date: '',
                case_status: '',
                service_type: '',
              });
              fetchReport();
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-700/80 rounded-xl transition"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Main Report View */}
      {loading ? (
        <LoadingSpinner size="lg" text="Aggregating metrics and compiling report..." />
      ) : !reportData ? null : (
        <div className="space-y-6">
          {/* Executive Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Report Total Cases"
              value={reportData.total_cases}
              subtitle="Matching active filter scope"
              icon={FileText}
              color="gold"
            />
            <MetricCard
              title="Total Package Value"
              value={formatCurrency(reportData.total_revenue)}
              subtitle="Aggregated service revenue"
              icon={DollarSign}
              color="emerald"
            />
            <MetricCard
              title="Service Categories"
              value={reportData.by_service?.length || 0}
              subtitle="Active operational categories"
              icon={PieChart}
              color="purple"
            />
          </div>

          {/* Breakdown Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs uppercase tracking-wider font-bold text-amber-400 font-serif-brand">
                Case Status Breakdown
              </h3>
              <div className="space-y-2.5">
                {reportData.by_status?.map((item) => (
                  <div
                    key={item.case_status}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                  >
                    <CaseStatusBadge status={item.case_status} />
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-100 font-mono">{item.count} cases</span>
                      <span className="font-mono text-slate-400">{formatCurrency(item.total || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Type Distribution */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs uppercase tracking-wider font-bold text-amber-400 font-serif-brand">
                Service Type Breakdown
              </h3>
              <div className="space-y-2.5">
                {reportData.by_service?.map((item) => (
                  <div
                    key={item.service_type}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                  >
                    <span className="font-semibold text-slate-200">{item.service_type}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-amber-400 font-mono">{item.count} cases</span>
                      <span className="font-mono text-slate-400">{formatCurrency(item.total || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Records Preview Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-300 font-serif-brand">
                Records Included in Report Scope ({reportData.recent_records?.length} previewed)
              </h3>
              <span className="text-[11px] text-slate-500">
                Full list available via CSV download
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Case No.</th>
                    <th className="py-2.5 px-4">Deceased</th>
                    <th className="py-2.5 px-4">Service</th>
                    <th className="py-2.5 px-4">Passing Date</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Package Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reportData.recent_records?.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-2.5 px-4 font-mono font-bold text-amber-400">{r.case_number}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-200">{r.deceased_name}</td>
                      <td className="py-2.5 px-4 text-slate-400">{r.service_type}</td>
                      <td className="py-2.5 px-4 text-slate-400">{formatDate(r.date_of_passing)}</td>
                      <td className="py-2.5 px-4">
                        <CaseStatusBadge status={r.case_status} />
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-200 text-right">
                        {formatCurrency(r.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
