import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { caseService } from '../services/caseService';
import { reportService } from '../services/extraServices';
import { useToast } from '../context/ToastContext';
import { CaseStatusBadge, LoadingSpinner } from '../components/BadgesAndCards';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatDate, formatCurrency } from '../utils/formatters';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  Calendar,
  Receipt,
  Printer,
  Download,
} from 'lucide-react';

export const Cases = () => {
  const { canDeleteRecords, canEditRecords, canExportReports, isStaff } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  // Delete dialog state
  const [caseToDelete, setCaseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await caseService.getCases({
        search,
        case_status: statusFilter,
        service_type: serviceFilter,
      });
      setCases(data.results ? data.results : data);
    } catch {
      toast.error('Failed to load funeral cases.');
    } finally {
      setLoading(false);
    }
  };

  // Sync with searchParams if navigated from Navbar search
  useEffect(() => {
    const urlQuery = searchParams.get('search');
    if (urlQuery !== null && urlQuery !== search) {
      setSearch(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchCases();
  }, [statusFilter, serviceFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(search ? { search } : {});
    fetchCases();
  };

  const handleConfirmDelete = async () => {
    if (!caseToDelete) return;
    setDeleteLoading(true);
    try {
      await caseService.deleteCase(caseToDelete.id);
      toast.success('Record deleted successfully.');
      setCaseToDelete(null);
      fetchCases();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete case record.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await reportService.downloadReportCSV({
        case_status: statusFilter,
        service_type: serviceFilter,
      });
      toast.success('Cases CSV exported successfully.');
    } catch {
      toast.error('Failed to export CSV.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-serif-brand text-slate-100 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-amber-500" />
            <span>FUNERAL CASE MANAGEMENT</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Admissions, service arrangements, chapel allocation, and permanent case archives.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {canExportReports && (
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-semibold transition disabled:opacity-50"
              title="Download filtered cases to CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>
          )}

          <Link
            to="/cases/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 transition"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE CASE</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Case No., BIR Receipt, or Deceased..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
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
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Services</option>
            <option value="Traditional Burial">Traditional Burial</option>
            <option value="Direct Cremation">Direct Cremation</option>
            <option value="Cremation with Viewing">Cremation with Viewing</option>
            <option value="Memorial Service">Memorial Service</option>
            <option value="Repatriation">Repatriation</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setServiceFilter('');
              setSearchParams({});
              fetchCases();
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-700/80 rounded-xl transition"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cases Table */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" text="Retrieving funeral case records..." />
        ) : cases.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            No funeral cases found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Case Number</th>
                  <th className="py-3 px-4">Deceased Name</th>
                  <th className="py-3 px-4">Service Type</th>
                  <th className="py-3 px-4">Chapel / Suite</th>
                  <th className="py-3 px-4">Passing Date</th>
                  <th className="py-3 px-4">Case Status</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Link to={`/cases/${c.id}`} className="font-mono font-bold text-amber-400 hover:underline block">
                        {c.case_number}
                      </Link>
                      {c.bir_receipt_number && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20 mt-0.5">
                          <Receipt className="w-2.5 h-2.5" />
                          {c.bir_receipt_number}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100 whitespace-nowrap">
                      {c.deceased_name}
                      {c.age && <span className="text-slate-400 font-normal ml-1">({c.age} y/o)</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {c.service_type}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {c.chapel_room || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {formatDate(c.date_of_passing)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <CaseStatusBadge status={c.case_status} />
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-200 whitespace-nowrap">
                      {formatCurrency(c.total_amount)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/cases/${c.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-amber-400 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition"
                          title="View Case Dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>

                        {canEditRecords && (
                          <Link
                            to={`/cases/${c.id}/edit`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 rounded-lg transition"
                            title="Edit Case Record"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Link>
                        )}

                        <button
                          onClick={() => navigate(`/cases/${c.id}?print=true`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 rounded-lg transition"
                          title="Print Official Case Dossier"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>

                        {/* Admin-only Delete: Protected by backend permissions as well */}
                        {canDeleteRecords && (
                          <button
                            onClick={() => setCaseToDelete(c)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/30 rounded-lg transition"
                            title="Delete Record (Master Admin Only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Record Deletion */}
      <ConfirmDialog
        isOpen={!!caseToDelete}
        onClose={() => setCaseToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="DELETE RECORD?"
        message={`Are you sure you want to delete this record? Case: "${caseToDelete?.case_number}" for ${caseToDelete?.deceased_name}.`}
        confirmText="DELETE"
        cancelText="CANCEL"
        isLoading={deleteLoading}
        isDanger={true}
      />
    </div>
  );
};
