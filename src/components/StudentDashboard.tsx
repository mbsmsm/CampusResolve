import React, { useState, useEffect, useMemo } from 'react';
import type { Complaint, ComplaintCategory, ComplaintStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { getStudentComplaints } from '../services/complaintService';
import { ComplaintStatusBadge } from './ComplaintStatusBadge';
import {
  Plus,
  Search,
  RefreshCw,
  Inbox,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface Props {
  onOpenNewComplaintModal: () => void;
}

export const StudentDashboard: React.FC<Props> = ({ onOpenNewComplaintModal }) => {
  const { userProfile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'All'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const fetchComplaints = async () => {
    if (!userProfile) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentComplaints(userProfile.uid);
      setComplaints(data);
    } catch (err: any) {
      console.error('Failed to fetch student complaints:', err);
      setError('Unable to load complaints. Please check network or Firebase connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [userProfile?.uid]);

  // Metrics
  const metrics = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === 'Pending').length;
    const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;
    return { total, pending, inProgress, resolved };
  }, [complaints]);

  // Filtered and sorted complaints
  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) => {
        const matchesSearch =
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [complaints, searchQuery, statusFilter, categoryFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-100">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-indigo-100 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Student Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {userProfile?.displayName || 'Student'}!
            </h1>
            <p className="text-sm text-indigo-100 max-w-xl">
              Track the live progress of your campus grievances or register a new complaint for immediate review by college authorities.
            </p>
          </div>

          <button
            onClick={onOpenNewComplaintModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-700 font-bold text-sm shadow-lg shadow-black/10 hover:bg-indigo-50 active:scale-98 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-5 h-5 text-indigo-600 stroke-[2.5]" />
            <span>File New Complaint</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Filed
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

        {/* Pending Card */}
        <div className="p-5 rounded-2xl bg-white border border-amber-200/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Pending
            </span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">{metrics.pending}</span>
            <span className="text-xs text-amber-600/70">awaiting review</span>
          </div>
        </div>

        {/* In Progress Card */}
        <div className="p-5 rounded-2xl bg-white border border-blue-200/60 shadow-xs">
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
            <span className="text-xs text-blue-600/70">investigating</span>
          </div>
        </div>

        {/* Resolved Card */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-200/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Resolved
            </span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {metrics.resolved}
            </span>
            <span className="text-xs text-emerald-600/70">completed</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, or category..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchComplaints}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Refresh Complaints"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Complaints List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-900">
            My Submitted Complaints ({filteredComplaints.length})
          </h2>
          <span className="text-xs text-slate-500">
            Filtered from {complaints.length} total
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
                <div className="h-4 bg-slate-200 rounded-md w-1/3" />
                <div className="h-3 bg-slate-100 rounded-md w-2/3" />
                <div className="h-3 bg-slate-100 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="py-14 text-center rounded-3xl bg-white border border-dashed border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No complaints found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'All' || categoryFilter !== 'All'
                ? 'No complaints matched your active search filters. Try clearing filters.'
                : "You haven't submitted any complaints yet. Use the button below to report an issue."}
            </p>
            {complaints.length === 0 && (
              <button
                onClick={onOpenNewComplaintModal}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-sm hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>File Your First Complaint</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredComplaints.map((item) => (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-200 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                {/* Header row: Category & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <ComplaintStatusBadge status={item.status} />
                </div>

                {/* Complaint Title */}
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>

                {/* Admin Remarks section (if available) */}
                {item.adminRemarks && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Official Administrative Update:</span>
                    </div>
                    <p className="text-indigo-800 leading-relaxed">
                      {item.adminRemarks}
                    </p>
                    {item.resolvedAt && (
                      <p className="text-[11px] text-indigo-500 font-medium pt-0.5">
                        Marked resolved on{' '}
                        {new Date(item.resolvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
