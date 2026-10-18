import React, { useState, useEffect, useMemo } from 'react';
import type { Complaint, ComplaintCategory, ComplaintStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
} from '../services/complaintService';
import { ComplaintStatusBadge } from './ComplaintStatusBadge';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  Trash2,
  Save,
  Inbox,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status updating state: [complaintId]: { status, remarks, saving }
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [remarksDrafts, setRemarksDrafts] = useState<Record<string, string>>({});
  const [statusDrafts, setStatusDrafts] = useState<Record<string, ComplaintStatus>>({});

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'All'>('All');

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllComplaints();
      setComplaints(data);
      // Initialize drafts
      const drafts: Record<string, string> = {};
      const statusMap: Record<string, ComplaintStatus> = {};
      data.forEach((c) => {
        drafts[c.id] = c.adminRemarks || '';
        statusMap[c.id] = c.status;
      });
      setRemarksDrafts(drafts);
      setStatusDrafts(statusMap);
    } catch (err: any) {
      console.error('Failed to fetch admin complaints:', err);
      setError('Unable to fetch complaints list. Check permissions or Firebase credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdate = async (id: string) => {
    const newStatus = statusDrafts[id];
    const newRemarks = remarksDrafts[id];
    setUpdatingId(id);
    try {
      await updateComplaintStatus(id, newStatus, newRemarks);
      // Update local state
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: newStatus,
                adminRemarks: newRemarks,
                updatedAt: new Date().toISOString(),
                resolvedAt: newStatus === 'Resolved' ? new Date().toISOString() : c.resolvedAt,
              }
            : c
        )
      );
    } catch (err: any) {
      alert('Failed to update complaint: ' + (err.message || 'Unknown error'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this complaint record?')) return;
    try {
      await deleteComplaint(id);
      setComplaints((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert('Failed to delete complaint: ' + (err.message || 'Unknown error'));
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === 'Pending').length;
    const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;
    return { total, pending, inProgress, resolved };
  }, [complaints]);

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.studentName.toLowerCase().includes(q) ||
        c.studentEmail.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [complaints, searchQuery, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Admin Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-violet-400" />
              <span>Administrative Oversight Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Grievance Cell Dashboard
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Logged in as {userProfile?.displayName} ({userProfile?.email}). Review campus complaints, update progress statuses, and issue official resolution remarks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchComplaints}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/5 text-white font-semibold text-xs backdrop-blur-md border border-white/10 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Logged
            </span>
            <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.total}</span>
            <span className="text-xs text-slate-400">cases</span>
          </div>
        </div>

        {/* Pending Action Required */}
        <div className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Pending Review
            </span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">{metrics.pending}</span>
            <span className="text-xs text-amber-700/70 font-medium">needs action</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="p-5 rounded-2xl bg-white border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              In Progress
            </span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-600">
              {metrics.inProgress}
            </span>
            <span className="text-xs text-blue-700/70">investigating</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Resolved Cases
            </span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {metrics.resolved}
            </span>
            <span className="text-xs text-emerald-700/70">completed</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, title, or keyword..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Only</option>
            <option value="In Progress">In Progress Only</option>
            <option value="Resolved">Resolved Only</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="All">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Hostel">Hostel</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Canteen">Canteen</option>
            <option value="Library">Library</option>
            <option value="Administration">Administration</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Complaints List with Admin Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-900">
            Complaint Redressal Queue ({filteredComplaints.length})
          </h2>
          <span className="text-xs text-slate-500">
            Showing all student submissions across campus
          </span>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 animate-pulse space-y-3"
              >
                <div className="h-4 bg-slate-200 rounded-md w-1/4" />
                <div className="h-3 bg-slate-100 rounded-md w-3/4" />
                <div className="h-3 bg-slate-100 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="py-14 text-center rounded-3xl bg-white border border-dashed border-slate-200 p-8 space-y-2">
            <Inbox className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-800 text-sm">No complaints found</h3>
            <p className="text-xs text-slate-500">
              No complaint tickets match the selected criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((item) => {
              const currentStatusDraft = statusDrafts[item.id] || item.status;
              const currentRemarksDraft = remarksDrafts[item.id] !== undefined ? remarksDrafts[item.id] : item.adminRemarks || '';
              const hasChanges =
                currentStatusDraft !== item.status || currentRemarksDraft !== (item.adminRemarks || '');
              const isUpdating = updatingId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 transition-all"
                >
                  {/* Top line: Student metadata & Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900">
                          {item.studentName}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1.5 font-mono">
                          ({item.studentEmail})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                      <ComplaintStatusBadge status={item.status} />
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                        title="Delete complaint ticket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Complaint Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Filing Date:{' '}
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                    <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Admin Resolution & Status Management Panel */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Update Status:
                        </label>
                        <select
                          value={currentStatusDraft}
                          onChange={(e) =>
                            setStatusDrafts({
                              ...statusDrafts,
                              [item.id]: e.target.value as ComplaintStatus,
                            })
                          }
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>

                      {hasChanges && (
                        <button
                          onClick={() => handleUpdate(item.id)}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-all disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Official Remarks text field */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Official Administrator Remarks / Action Taken:
                      </label>
                      <input
                        type="text"
                        value={currentRemarksDraft}
                        onChange={(e) =>
                          setRemarksDrafts({
                            ...remarksDrafts,
                            [item.id]: e.target.value,
                          })
                        }
                        placeholder="e.g. Electrician assigned. Parts ordered. Expected resolution by Friday..."
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
