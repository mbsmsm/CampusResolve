import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Lock,
  Mail,
  User,
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type AuthTab = 'student-login' | 'student-register' | 'admin-login';

export const AuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { login, register, isConfigured } = useAuth();
  const [tab, setTab] = useState<AuthTab>('student-login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [department, setDepartment] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'student-register') {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        await register(email, password, name, studentIdNumber, department);
      } else if (tab === 'admin-login') {
        // Enforce verified admin role check
        await login(email, password, 'admin');
      } else {
        // Student login
        await login(email, password, 'student');
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for demo/testing
  const fillDemo = (role: 'student' | 'admin') => {
    if (role === 'student') {
      setEmail('student@campus.edu');
      setPassword('student123');
      setTab('student-login');
    } else {
      setEmail('admin@campus.edu');
      setPassword('admin123');
      setTab('admin-login');
    }
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header Tabs */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => {
                setTab('student-login');
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                tab === 'student-login'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Login
            </button>
            <button
              onClick={() => {
                setTab('student-register');
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                tab === 'student-register'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => {
                setTab('admin-login');
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                tab === 'admin-login'
                  ? 'bg-white text-violet-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div className="text-center space-y-1">
            <div
              className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center shadow-md ${
                tab === 'admin-login'
                  ? 'bg-violet-600 text-white shadow-violet-100'
                  : 'bg-indigo-600 text-white shadow-indigo-100'
              }`}
            >
              {tab === 'admin-login' ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <GraduationCap className="w-6 h-6" />
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {tab === 'student-login' && 'Student Portal Sign In'}
              {tab === 'student-register' && 'New Student Registration'}
              {tab === 'admin-login' && 'Administrator Portal Sign In'}
            </h2>
            <p className="text-xs text-slate-500">
              {tab === 'student-register'
                ? 'Create a student profile to file and track grievances'
                : tab === 'admin-login'
                ? 'Restricted to authorized college grievance cell officials'
                : 'Enter your campus credentials to access your dashboard'}
            </p>
          </div>

          {/* Admin Registration Notice */}
          {tab === 'admin-login' && (
            <div className="p-3 bg-violet-50 rounded-xl border border-violet-100 text-violet-900 text-[11px] leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
              <span>
                <strong>Security Guard:</strong> To prevent unauthorized escalation, admin privileges can never be registered publicly. Admin roles must be assigned directly in the database.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'student-register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Student ID / Roll
                    </label>
                    <input
                      type="text"
                      value={studentIdNumber}
                      onChange={(e) => setStudentIdNumber(e.target.value)}
                      placeholder="e.g. CS2026-042"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campus.edu"
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-50 mt-2 ${
                tab === 'admin-login'
                  ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-100'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : tab === 'student-register' ? (
                'Create Student Account'
              ) : tab === 'admin-login' ? (
                'Sign In as Administrator'
              ) : (
                'Sign In as Student'
              )}
            </button>
          </form>

          {/* Quick Demo Previews */}
          {!isConfigured && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Preview Mode Quick Test:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('student')}
                  className="p-2 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-700 text-center transition-colors"
                >
                  ⚡ Student Demo
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="p-2 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-violet-50 border border-slate-200 text-slate-700 hover:text-violet-700 text-center transition-colors"
                >
                  ⚡ Admin Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
