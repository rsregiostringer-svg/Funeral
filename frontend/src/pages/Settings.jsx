import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Settings as SettingsIcon,
  Shield,
  Building,
  Clock,
  CheckCircle,
  Save,
  Server,
  Lock,
} from 'lucide-react';

export const Settings = () => {
  const { user, isMasterAdmin, isAdmin } = useAuth();
  const toast = useToast();

  const [settings, setSettings] = useState({
    funeral_home_name: 'ALAALA FUNERAL HOMES',
    tagline: 'Honoring Legacies, Preserving Sacred Memories',
    contact_hotline: '+63 (02) 8892-0000 / +63 917 800 2522',
    email_support: 'support@alaalafuneral.ph',
    address: '100 Memorial Way, Diliman, Quezon City, Metro Manila',
    idle_timeout_minutes: '3',
    session_timeout_minutes: '120',
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!isMasterAdmin) {
      toast.error('Only Master Admin can modify system settings.');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('System settings saved successfully.');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold font-serif-brand text-slate-100 flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-amber-500" />
          <span>SYSTEM & FACILITY SETTINGS</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Organization profile, surveillance thresholds, and administrative configuration.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Facility Information */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-2 flex items-center gap-2 text-amber-400">
            <Building className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-serif-brand">
              Funeral Home Organization
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Facility Name
              </label>
              <input
                type="text"
                disabled={!isMasterAdmin}
                name="funeral_home_name"
                value={settings.funeral_home_name}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-serif-brand text-amber-300 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Motto / Sacred Tagline
              </label>
              <input
                type="text"
                disabled={!isMasterAdmin}
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                24/7 Care Hotline
              </label>
              <input
                type="text"
                disabled={!isMasterAdmin}
                name="contact_hotline"
                value={settings.contact_hotline}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Official Support Email
              </label>
              <input
                type="email"
                disabled={!isMasterAdmin}
                name="email_support"
                value={settings.email_support}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Headquarters / Main Chapel Complex Address
            </label>
            <input
              type="text"
              disabled={!isMasterAdmin}
              name="address"
              value={settings.address}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Security & Idle Policy */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-2 flex items-center gap-2 text-amber-400">
            <Clock className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-serif-brand">
              Surveillance & Session Policy
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Idle Threshold (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                disabled={!isMasterAdmin}
                name="idle_timeout_minutes"
                value={settings.idle_timeout_minutes}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 disabled:opacity-60"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                User status becomes IDLE if no interaction occurs for this period.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                JWT Access Expiration (Minutes)
              </label>
              <input
                type="number"
                disabled
                name="session_timeout_minutes"
                value={settings.session_timeout_minutes}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-400 opacity-60 cursor-not-allowed"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Configured via DJANGO JWT_ACCESS_MINUTES in production.
              </p>
            </div>
          </div>
        </div>

        {/* Architecture & Security Status */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-2 flex items-center gap-2 text-amber-400">
            <Shield className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-serif-brand">
              Security & Environment Status
            </h2>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Master Admin Protection</span>
              </span>
              <span className="font-semibold text-emerald-400">ENABLED (Immutable Role)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Backend Role-Based Access Control</span>
              </span>
              <span className="font-semibold text-emerald-400">ENFORCED (Django REST)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Case Number Generation Policy</span>
              </span>
              <span className="font-semibold text-amber-400 font-mono">MANUAL ENTRY REQUIRED</span>
            </div>
          </div>
        </div>

        {/* Save button (Only for Master Admin) */}
        {isMasterAdmin && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'SAVING...' : 'SAVE SETTINGS'}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
