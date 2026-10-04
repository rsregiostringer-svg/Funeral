import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TriangleAlert, Trash2, X } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "DELETE RECORD?",
  message = "Are you sure you want to delete this record? This action cannot be undone.",
  confirmText = "DELETE",
  cancelText = "CANCEL",
  isLoading = false,
  isDanger = true,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isLoading ? onClose : undefined}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        />

        {/* Dialog Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md glass-panel rounded-2xl border border-rose-900/40 shadow-2xl p-6 z-10 overflow-hidden"
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${isDanger ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'}`}>
              {isDanger ? <Trash2 className="w-6 h-6" /> : <TriangleAlert className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold font-serif-brand text-slate-100 tracking-wide">
                {title}
              </h4>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`px-5 py-2 text-sm font-semibold rounded-lg shadow-lg flex items-center gap-2 transition disabled:opacity-50 ${isDanger
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                  : 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold'
                }`}
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
