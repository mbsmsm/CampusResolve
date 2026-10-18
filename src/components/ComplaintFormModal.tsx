import React, { useState } from 'react';
import type { ComplaintCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { submitComplaint } from '../services/complaintService';
import { X, Send, AlertTriangle, Calendar, Tag, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES: ComplaintCategory[] = [
  'Academic',
  'Hostel',
  'Infrastructure',
  'Canteen',
  'Library',
  'Administration',
  'Other',
];

export const ComplaintFormModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { userProfile } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Academic');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a complaint subject/title.');
      return;
    }
    if (description.trim().length < 15) {
      setError('Please provide a detailed description (at least 15 characters).');
      return;
    }
    if (!userProfile) {
      setError('You must be logged in to file a complaint.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitComplaint({
        title: title.trim(),
        description: description.trim(),
        category,
        studentId: userProfile.uid,
        studentName: userProfile.displayName || 'Student',
        studentEmail: userProfile.email,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('Academic');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to submit complaint:', err);
      setError(err.message || 'Failed to submit complaint. Please check your network or Firebase rules.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Register New Complaint</h3>
              <p className="text-xs text-indigo-100 mt-0.5">
                Submit an issue for administrative investigation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Submission Date Info */}
          <div className="flex items-center justify-between text-xs px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Filing Date:</span>
            </div>
            <span className="font-semibold text-slate-800">{currentDateString}</span>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Complaint Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject / Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken bench in lecture hall 204"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Description Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Detailed Description
              </label>
              <span className="text-[11px] text-slate-400">
                {description.length} chars (min 15)
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide specific details including exact location, room number, or equipment details..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Status Note */}
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/50">
            <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              All newly registered complaints are initially marked as <strong>Pending</strong>{' '}
              until reviewed by the college grievance officer.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-100 transition-all"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
