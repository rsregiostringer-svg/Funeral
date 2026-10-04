import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-4 shadow-xl">
        <FileQuestion className="w-12 h-12" />
      </div>
      <h2 className="text-3xl font-bold font-serif-brand text-slate-100 mb-2">
        Page Not Found
      </h2>
      <p className="text-sm text-slate-400 max-w-sm mb-6">
        The system path you requested does not exist or has been relocated.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold transition border border-slate-700"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
