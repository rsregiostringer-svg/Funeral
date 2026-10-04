import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { caseService } from '../services/caseService';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/BadgesAndCards';
import { useAuth } from '../context/AuthContext';
import { capitalizeWords, formatFullName } from '../utils/formatters';
import {
  FileText,
  Save,
  ArrowLeft,
  AlertCircle,
  Receipt,
} from 'lucide-react';

export const EditCase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { canEditRecords } = useAuth();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!canEditRecords) {
      toast.error('Access Restricted: You do not have permission to edit case records.');
      navigate(`/cases/${id}`);
      return;
    }

    const fetchCase = async () => {
      try {
        const data = await caseService.getCase(id);

        let decLast = data.deceased_last_name || '';
        let decFirst = data.deceased_first_name || '';
        let decMiddle = data.deceased_middle_name || '';
        if (!decLast && data.deceased_name) {
          if (data.deceased_name.includes(',')) {
            const [l, rest] = data.deceased_name.split(',', 2);
            decLast = l.trim();
            const restTokens = rest.trim().split(' ');
            decFirst = restTokens[0] || '';
            decMiddle = restTokens.slice(1).join(' ') || '';
          }
        }

        let infLast = data.informant_last_name || '';
        let infFirst = data.informant_first_name || '';
        let infMiddle = data.informant_middle_name || '';
        if (!infLast && data.informant_name) {
          if (data.informant_name.includes(',')) {
            const [l, rest] = data.informant_name.split(',', 2);
            infLast = l.trim();
            const restTokens = rest.trim().split(' ');
            infFirst = restTokens[0] || '';
            infMiddle = restTokens.slice(1).join(' ') || '';
          }
        }

        setFormData({
          case_number: data.case_number || '',
          bir_receipt_number: data.bir_receipt_number || '',
          deceased_last_name: decLast,
          deceased_first_name: decFirst,
          deceased_middle_name: decMiddle,
          deceased_name: data.deceased_name || '',
          gender: data.gender || 'Male',
          date_of_birth: data.date_of_birth || '',
          date_of_passing: data.date_of_passing || '',
          age: data.age !== null ? data.age : '',
          informant_last_name: infLast,
          informant_first_name: infFirst,
          informant_middle_name: infMiddle,
          informant_name: data.informant_name || '',
          informant_contact: data.informant_contact || '',
          informant_relationship: data.informant_relationship || '',
          informant_address: data.informant_address || '',
          service_type: data.service_type || 'Traditional Burial',
          chapel_room: data.chapel_room || '',
          casket_or_urn: data.casket_or_urn || '',
          cemetery_or_columbarium: data.cemetery_or_columbarium || '',
          interment_date: data.interment_date ? data.interment_date.slice(0, 16) : '',
          case_status: data.case_status || 'PENDING_EMBALMING',
          total_amount: data.total_amount !== undefined ? data.total_amount : '',
          notes: data.notes || '',
        });
      } catch {
        toast.error('Failed to load case data.');
        navigate('/cases');
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id, canEditRecords]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNameChange = (e) => {
    const { name, value } = e.target;
    const capitalized = capitalizeWords(value);
    setFormData((prev) => {
      const updated = { ...prev, [name]: capitalized };

      if (['deceased_last_name', 'deceased_first_name', 'deceased_middle_name'].includes(name)) {
        updated.deceased_name = formatFullName(
          updated.deceased_last_name,
          updated.deceased_first_name,
          updated.deceased_middle_name
        );
      }
      if (['informant_last_name', 'informant_first_name', 'informant_middle_name'].includes(name)) {
        updated.informant_name = formatFullName(
          updated.informant_last_name,
          updated.informant_first_name,
          updated.informant_middle_name
        );
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.case_number.trim()) {
      setErrorMessage('Case Number is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        case_number: formData.case_number.trim().toUpperCase(),
        age: formData.age !== '' ? parseInt(formData.age, 10) : null,
        total_amount: formData.total_amount !== '' ? parseFloat(formData.total_amount) : 0.0,
        interment_date: formData.interment_date ? formData.interment_date : null,
        date_of_birth: formData.date_of_birth ? formData.date_of_birth : null,
      };

      await caseService.updateCase(id, payload);
      toast.success('Case updated successfully.');
      navigate(`/cases/${id}`);
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.case_number) {
        const msg = Array.isArray(resp.case_number) ? resp.case_number[0] : resp.case_number;
        setErrorMessage(msg);
        toast.error(msg);
      } else if (resp?.detail) {
        setErrorMessage(resp.detail);
        toast.error(resp.detail);
      } else {
        setErrorMessage('Failed to update case record.');
        toast.error('Failed to update case record.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading case for editing..." />;
  }

  if (!formData) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <Link
            to={`/cases/${id}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Case Details</span>
          </Link>
          <h1 className="text-2xl font-bold font-serif-brand text-slate-100 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-amber-500" />
            <span>EDIT CASE: {formData.case_number}</span>
          </h1>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <div className="leading-relaxed font-semibold">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Case Number & BIR Code Receipt */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-serif-brand">
              Case Identification & BIR Receipt Code
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Official Case Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                name="case_number"
                value={formData.case_number}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 font-mono text-amber-300 font-bold uppercase focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                BIR Code Receipt / OR No.
              </label>
              <input
                type="text"
                name="bir_receipt_number"
                value={formData.bir_receipt_number}
                onChange={handleChange}
                placeholder="e.g. BIR-OR-2026-90481"
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 font-mono text-emerald-300 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Deceased Profile */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-serif-brand">
                Deceased Profile
              </h2>
              <p className="text-xs text-slate-400">
                Last Name, First Name, and Middle Name (First letters are automatically capitalized).
              </p>
            </div>
            {formData.deceased_name && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs font-mono text-amber-300">
                <span className="text-slate-400 uppercase text-[10px]">Formatted:</span>
                <span className="font-bold">{formData.deceased_name}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Last Name (Apelyido) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                name="deceased_last_name"
                value={formData.deceased_last_name}
                onChange={handleNameChange}
                placeholder="e.g. Dela Cruz"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none capitalize"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                First Name (Pangalan) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                name="deceased_first_name"
                value={formData.deceased_first_name}
                onChange={handleNameChange}
                placeholder="e.g. Juan"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none capitalize"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Middle Name (Gitnang Pangalan)
              </label>
              <input
                type="text"
                name="deceased_middle_name"
                value={formData.deceased_middle_name}
                onChange={handleNameChange}
                placeholder="e.g. Santos"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none capitalize"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Date of Passing <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                name="date_of_passing"
                value={formData.date_of_passing}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Informant */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-serif-brand">
                Family Informant
              </h2>
              <p className="text-xs text-slate-400">
                Last Name, First Name, and Middle Name of next of kin or representative.
              </p>
            </div>
            {formData.informant_name && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs font-mono text-amber-300">
                <span className="text-slate-400 uppercase text-[10px]">Formatted:</span>
                <span className="font-bold">{formData.informant_name}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Last Name (Apelyido) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                name="informant_last_name"
                value={formData.informant_last_name}
                onChange={handleNameChange}
                placeholder="e.g. Dela Cruz"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none capitalize"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                First Name (Pangalan) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                name="informant_first_name"
                value={formData.informant_first_name}
                onChange={handleNameChange}
                placeholder="e.g. Maria"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none capitalize"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Middle Name (Gitnang Pangalan)
              </label>
              <input
                type="text"
                name="informant_middle_name"
                value={formData.informant_middle_name}
                onChange={handleNameChange}
                placeholder="e.g. Ramos"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none capitalize"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Contact Phone <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                name="informant_contact"
                value={formData.informant_contact}
                onChange={handleChange}
                placeholder="e.g. +63 917 123 4567"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Relationship <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                name="informant_relationship"
                value={formData.informant_relationship}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Address
            </label>
            <input
              type="text"
              name="informant_address"
              value={formData.informant_address}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Service & Chapel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-serif-brand">
              Service & Status
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Service Type
              </label>
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none"
              >
                <option value="Traditional Burial">Traditional Burial</option>
                <option value="Direct Cremation">Direct Cremation</option>
                <option value="Cremation with Viewing">Cremation with Viewing</option>
                <option value="Memorial Service">Memorial Service</option>
                <option value="Repatriation">Repatriation</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Case Status
              </label>
              <select
                name="case_status"
                value={formData.case_status}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none"
              >
                <option value="PENDING_EMBALMING">Pending Embalming</option>
                <option value="IN_VIEWING">In Viewing / Chapel</option>
                <option value="SCHEDULED_FOR_BURIAL">Scheduled for Burial</option>
                <option value="SCHEDULED_FOR_CREMATION">Scheduled for Cremation</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Chapel Room
              </label>
              <input
                type="text"
                name="chapel_room"
                value={formData.chapel_room}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Casket / Urn
              </label>
              <input
                type="text"
                name="casket_or_urn"
                value={formData.casket_or_urn}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Total Amount (PHP)
              </label>
              <input
                type="number"
                step="0.01"
                name="total_amount"
                value={formData.total_amount}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Notes
            </label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl p-3 text-sm text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to={`/cases/${id}`}
            className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-7 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xl transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'SAVING CHANGES...' : 'UPDATE CASE RECORD'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
