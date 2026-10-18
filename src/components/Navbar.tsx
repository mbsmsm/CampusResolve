import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  User,
  LogOut,
  HelpCircle,
  Database,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  onOpenSetupGuide: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSetupGuide, onOpenAuthModal }) => {
  const { userProfile, logout, isConfigured, switchDemoRole } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg">
                  CampusResolve
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Grievance Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Student Complaint Redressal & Resolution System
              </p>
            </div>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {/* Firebase Status Badge */}
            <button
              onClick={onOpenSetupGuide}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                isConfigured
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              }`}
              title="Click for Firebase configuration details"
            >
              {isConfigured ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Firebase Live</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span>Preview Mode</span>
                  <HelpCircle className="w-3 h-3 text-amber-500" />
                </>
              )}
            </button>

            {userProfile ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Role Switcher in Demo Mode */}
                {!isConfigured && (
                  <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                    <button
                      onClick={() => switchDemoRole('student')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                        userProfile.role === 'student'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Student View
                    </button>
                    <button
                      onClick={() => switchDemoRole('admin')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                        userProfile.role === 'admin'
                          ? 'bg-white text-violet-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Admin View
                    </button>
                  </div>
                )}

                {/* User Identity Pill */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      userProfile.role === 'admin'
                        ? 'bg-violet-100 text-violet-700 border border-violet-200'
                        : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {userProfile.displayName}
                    </p>
                    <span
                      className={`inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                        userProfile.role === 'admin'
                          ? 'bg-violet-50 text-violet-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {userProfile.role}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
