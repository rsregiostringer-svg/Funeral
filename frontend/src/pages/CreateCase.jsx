import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { caseService } from '../services/caseService';
import { useToast } from '../context/ToastContext';
import { capitalizeWords, formatFullName } from '../utils/formatters';
import {
  FileText,
  User,
  Phone,
  Calendar,
  Save,
  ArrowLeft,
  AlertCircle,
  Clock,
  MapPin,
  Tag,
  Shuffle,
  Receipt,
} from 'lucide-react';

const generateRandomCaseNumber = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `AFH-${year}-${randomNum}`;
};

export const CreateCase = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    case_number: generateRandomCaseNumber(), // Randomly generated
    bir_receipt_number: '', // Code receipt from BIR entered by user
    deceased_last_name: '',
    deceased_first_name: '',
    deceased_middle_name: '',
    deceased_name: '',
    gender: 'Male',
    date_of_birth: '',
    date_of_passing: new Date().toISOString().slice(0, 10),
    age: '',
    informant_last_name: '',
    informant_first_name: '',
    informant_middle_name: '',
    informant_name: '',
    informant_contact: '',
    informant_relationship: '',
    informant_address: '',
    service_type: 'Traditional Burial',
    chapel_room: '',
    casket_or_urn: '',
    cemetery_or_columbarium: '',
    interment_date: '',
    case_status: 'PENDING_EMBALMING',
    total_amount: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleRandomizeCaseNumber = () => {
    const newCode = generateRandomCaseNumber();
    setFormData((prev) => ({ ...prev, case_number: newCode }));
    toast.info(`Generated new case number: ${newCode}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.case_number.trim()) {
      setErrorMessage('Case Number is required.');
      toast.error('Case Number is required.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        case_number: formData.case_number.trim().toUpperCase(),
        age: formData.age ? parseInt(formData.age, 10) : null,
        total_amount: formData.total_amount ? parseFloat(formData.total_amount) : 0.0,
        interment_date: formData.interment_date ? formData.interment_date : null,
        date_of_birth: formData.date_of_birth ? formData.date_of_birth : null,
      };

      const newCase = await caseService.createCase(payload);
      toast.success('Case saved successfully.');
      navigate(`/cases/${newCase.id}`);
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
        const firstKey = Object.keys(resp || {})[0];
        const msg = firstKey ? `${firstKey}: ${resp[firstKey]}` : 'Failed to save case. Please check all fields.';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <Link
            to="/cases"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Case Records</span>
          </Link>
          <h1 className="text-2xl font-bold font-serif-brand text-slate-100 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-amber-500" />
            <span>CREATE FUNERAL CASE</span>
          </h1>
        </div>
      </div>

      {/* Validation Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <div className="leading-relaxed font-semibold">{errorMessage}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Case Identification & Official BIR Code Receipt */}
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-5">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-serif-brand">
              1. Case Identification & BIR Receipt Code
            </h2>
            <p className="text-xs text-slate-400">
              The case number is generated randomly. Input the official receipt code from the Bureau of Internal Revenue (BIR) below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Random Case Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Case Number <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeCaseNumber}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition"
                  title="Generate a different random number"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Randomize</span>
                </button>
              </div>
              <input
                type="text"
                required
                name="case_number"
                value={formData.case_number}
                onChange={handleChange}
                placeholder="e.g. AFH-2026-89421"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-base font-mono font-bold text-amber-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 uppercase"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Randomized unique tracking number for this funeral case file.
              </p>
            </div>

            {/* BIR Code Receipt */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                  <span>BIR Code Receipt / OR No.</span>
                </label>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                  BIR RECEIPT
                </span>
              </div>
              <input
                type="text"
                name="bir_receipt_number"
                value={formData.bir_receipt_number}
                onChange={handleChange}
                placeholder="Enter BIR Code Receipt (e.g. BIR-OR-2026-90481)"
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-mono text-emerald-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                The official receipt / invoice code from the Bureau of Internal Revenue (BIR).
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Deceased Profile */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="border-b border-slate-800 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-serif-brand">
                2. Deceased Profile
              </h2>
              <p className="text-xs text-slate-400">
                Input Last Name, First Name, and Middle Name. First letters are automatically capitalized.
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
                Date of Birth (Optional)
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
                Age at Passing
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 74"
                min="0"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Informant / Next of Kin */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="border-b border-slate-800 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-serif-brand">
                3. Family Representative / Informant
              </h2>
              <p className="text-xs text-slate-400">
                Input Last Name, First Name, and Middle Name of next of kin or family coordinator.
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
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Relationship to Deceased <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                name="informant_relationship"
                value={formData.informant_relationship}
                onChange={handleChange}
                placeholder="e.g. Spouse / Daughter / Son / Sibling"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Residential Address (Optional)
            </label>
            <input
              type="text"
              name="informant_address"
              value={formData.informant_address}
              onChange={handleChange}
              placeholder="e.g. 142 Magnolia St., Quezon City"
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Section 4: Funeral Service Specifications */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-serif-brand">
              4. Service & Chapel Arrangements
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
                Chapel / Viewing Room
              </label>
              <input
                type="text"
                name="chapel_room"
                value={formData.chapel_room}
                onChange={handleChange}
                placeholder="e.g. Serenity Hall A / St. Peter Suite"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Casket or Urn Model
              </label>
              <input
                type="text"
                name="casket_or_urn"
                value={formData.casket_or_urn}
                onChange={handleChange}
                placeholder="e.g. Solid Mahogany / Classic Bronze"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Cemetery / Columbarium
              </label>
              <input
                type="text"
                name="cemetery_or_columbarium"
                value={formData.cemetery_or_columbarium}
                onChange={handleChange}
                placeholder="e.g. Loyola Memorial Park"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Interment / Service Date
              </label>
              <input
                type="datetime-local"
                name="interment_date"
                value={formData.interment_date}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Financial, Status & Notes */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-serif-brand">
              5. Operations & Financial Status
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Initial Case Status
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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Total Service Package Amount (PHP)
              </label>
              <input
                type="number"
                step="0.01"
                name="total_amount"
                value={formData.total_amount}
                onChange={handleChange}
                placeholder="e.g. 150000.00"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Operational Notes & Family Requests
            </label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Family requested bilingual eulogy service, evening choir coordination..."
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/cases"
            className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xl shadow-amber-900/40 transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>SAVING CASE...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SAVE FUNERAL CASE</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
