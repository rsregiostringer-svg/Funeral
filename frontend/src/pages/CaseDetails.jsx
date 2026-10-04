import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { caseService } from '../services/caseService';
import { useToast } from '../context/ToastContext';
import { CaseStatusBadge, LoadingSpinner } from '../components/BadgesAndCards';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatDate, formatDateTime, formatCurrency } from '../utils/formatters';
import {
  FileText,
  User,
  Phone,
  Calendar,
  Pencil,
  Trash2,
  ArrowLeft,
  Printer,
  Clock,
  MapPin,
  Tag,
  ShieldCheck,
  Receipt,
} from 'lucide-react';

export const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { canDeleteRecords, canEditRecords, isMasterAdmin, isAdmin } = useAuth();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (caseData && searchParams.get('print') === 'true') {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [caseData, searchParams]);

  const fetchCase = async () => {
    try {
      const data = await caseService.getCase(id);
      setCaseData(data);
    } catch (err) {
      toast.error('Case not found or permission denied.');
      navigate('/cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [id]);

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await caseService.deleteCase(id);
      toast.success('Record deleted successfully.');
      navigate('/cases');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete record.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Retrieving case file..." />;
  }

  if (!caseData) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-800 print:hidden">
        <div>
          <Link
            to="/cases"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 mb-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Case Records</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold font-serif-brand text-slate-100">
              Case: <span className="font-mono text-amber-400">{caseData.case_number}</span>
            </h1>
            <CaseStatusBadge status={caseData.case_status} />
            {caseData.bir_receipt_number && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                <span>BIR Receipt: {caseData.bir_receipt_number}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-xl transition"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Dossier</span>
          </button>

          {canEditRecords && (
            <Link
              to={`/cases/${caseData.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              <Pencil className="w-4 h-4 text-amber-400" />
              <span>Edit Case</span>
            </Link>
          )}

          {canDeleteRecords && (
            <button
              onClick={() => setDeleteDialogOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/30 rounded-xl transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Notice */}
      {isAdmin && (
        <div className="glass-panel px-4 py-3 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 text-indigo-300 text-xs flex items-center gap-3 print:hidden">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="leading-relaxed">
            <span className="font-bold text-slate-100">Admin Privileges: </span>
            You have full authorization to view, edit, and print memorial dossiers, as well as export official reports. Permanent record deletion is restricted to Master Admin.
          </div>
        </div>
      )}

      {/* Printable Memorial Dossier Header */}
      <div className="hidden print:block text-center pb-6 border-b border-black">
        <h2 className="text-2xl font-bold font-serif-brand">ALAALA FUNERAL HOMES</h2>
        <p className="text-xs uppercase tracking-widest">Official Memorial Case Dossier</p>
      </div>

      {/* Main Dossier Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="md:col-span-2 space-y-6">
          {/* Deceased Summary Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-amber-400 font-serif-brand flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Deceased Memorial Information</span>
            </h3>

            <div className="border-t border-slate-800 pt-3 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs uppercase">Full Legal Name:</span>
                <span className="font-semibold text-slate-100 font-serif-brand text-base">{caseData.deceased_name}</span>
              </div>

              {(caseData.deceased_last_name || caseData.deceased_first_name) && (
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 uppercase block text-[10px]">Last Name</span>
                    <span className="text-slate-200 font-semibold">{caseData.deceased_last_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block text-[10px]">First Name</span>
                    <span className="text-slate-200 font-semibold">{caseData.deceased_first_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block text-[10px]">Middle Name</span>
                    <span className="text-slate-200 font-semibold">{caseData.deceased_middle_name || '—'}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs uppercase">Gender / Age:</span>
                <span className="text-slate-200">{caseData.gender} {caseData.age ? `• ${caseData.age} years old` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs uppercase">Date of Passing:</span>
                <span className="font-mono text-slate-200">{formatDate(caseData.date_of_passing)}</span>
              </div>
              {caseData.date_of_birth && (
                <div className="flex justify-between">
                  <span className="text-slate-400 text-xs uppercase">Date of Birth:</span>
                  <span className="font-mono text-slate-200">{formatDate(caseData.date_of_birth)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Service & Chapel Arrangements */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-amber-400 font-serif-brand flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Service & Chapel Specifications</span>
            </h3>

            <div className="border-t border-slate-800 pt-3 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs uppercase">Service Type:</span>
                <span className="font-semibold text-amber-300">{caseData.service_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs uppercase">Chapel / Suite:</span>
                <span className="text-slate-200">{caseData.chapel_room || 'Not Assigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs uppercase">Casket / Urn Selection:</span>
                <span className="text-slate-200">{caseData.casket_or_urn || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs uppercase">Cemetery / Columbary:</span>
                <span className="text-slate-200">{caseData.cemetery_or_columbarium || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs uppercase">Interment Date & Time:</span>
                <span className="font-mono text-slate-200">{formatDateTime(caseData.interment_date)}</span>
              </div>
            </div>
          </div>

          {/* Operational Notes */}
          {caseData.notes && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 font-serif-brand">
                Operational Notes & Instructions
              </h3>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {caseData.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Informant Representative Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-amber-400 font-serif-brand flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Family Informant</span>
            </h3>

            <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
              <div>
                <span className="text-slate-500 uppercase block">Representative:</span>
                <span className="font-semibold text-slate-100 text-sm">{caseData.informant_name}</span>
              </div>

              {(caseData.informant_last_name || caseData.informant_first_name) && (
                <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-500 uppercase block text-[9px]">Last Name</span>
                    <span className="text-slate-200 font-medium">{caseData.informant_last_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block text-[9px]">First Name</span>
                    <span className="text-slate-200 font-medium">{caseData.informant_first_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block text-[9px]">Middle Name</span>
                    <span className="text-slate-200 font-medium">{caseData.informant_middle_name || '—'}</span>
                  </div>
                </div>
              )}
              <div>
                <span className="text-slate-500 uppercase block">Relationship:</span>
                <span className="text-slate-300">{caseData.informant_relationship}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase block">Contact Phone:</span>
                <span className="font-mono text-amber-400">{caseData.informant_contact}</span>
              </div>
              {caseData.informant_address && (
                <div>
                  <span className="text-slate-500 uppercase block">Address:</span>
                  <span className="text-slate-300">{caseData.informant_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 font-serif-brand flex items-center justify-between">
              <span>Package & Charges</span>
              <Receipt className="w-4 h-4 text-emerald-400" />
            </h3>
            <div className="border-t border-slate-800 pt-3 space-y-3">
              <div>
                <span className="text-xs text-slate-500 uppercase block">Total Package Amount</span>
                <span className="text-2xl font-bold font-serif-brand text-amber-300 font-mono">
                  {formatCurrency(caseData.total_amount)}
                </span>
              </div>
              <div className="border-t border-slate-800/80 pt-2.5">
                <span className="text-xs text-slate-500 uppercase block mb-1">BIR Code Receipt / OR No.</span>
                {caseData.bir_receipt_number ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                    <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                    {caseData.bir_receipt_number}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 italic">No BIR receipt code recorded</span>
                )}
              </div>
            </div>
          </div>

          {/* Audit Metadata Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-2.5 text-[11px] text-slate-400">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Audit Stamping
            </h4>
            <div className="border-t border-slate-800 pt-2 space-y-1.5">
              <div>
                <span className="text-slate-500">Created By: </span>
                <span className="text-slate-300 font-medium">
                  {caseData.created_by_detail ? `${caseData.created_by_detail.name} (@${caseData.created_by_detail.username})` : 'System'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Created: </span>
                <span className="font-mono text-slate-300">{formatDateTime(caseData.created_at)}</span>
              </div>
              {caseData.updated_by_detail && (
                <div>
                  <span className="text-slate-500">Last Modified By: </span>
                  <span className="text-slate-300 font-medium">{caseData.updated_by_detail.name}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500">Last Updated: </span>
                <span className="font-mono text-slate-300">{formatDateTime(caseData.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Record Deletion */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="DELETE RECORD?"
        message={`Are you sure you want to delete this record? Case: "${caseData.case_number}" for ${caseData.deceased_name}.`}
        confirmText="DELETE"
        cancelText="CANCEL"
        isLoading={deleteLoading}
        isDanger={true}
      />
    </div>
  );
};
