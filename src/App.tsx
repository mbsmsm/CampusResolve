import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ComplaintFormModal } from './components/ComplaintFormModal';
import { AuthModal } from './components/AuthModal';
import { FirebaseSetupGuide } from './components/FirebaseSetupGuide';
import {
  ShieldAlert,
  GraduationCap,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { userProfile, loading, isConfigured } = useAuth();
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleComplaintSuccess = () => {
    // Triggers dashboard refresh
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navbar */}
      <Navbar
        onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Firebase Notice Banner (shown if credentials are not configured yet) */}
      {!isConfigured && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 shrink-0" />
              <span>
                <strong>Running in Interactive Preview Mode.</strong> Firebase API keys not yet added to <code className="bg-black/20 px-1 py-0.5 rounded font-mono">.env</code>. You can fully test all Student and Admin workflows now.
              </span>
            </div>
            <button
              onClick={() => setIsSetupGuideOpen(true)}
              className="px-2.5 py-1 bg-white text-amber-800 hover:bg-amber-50 font-bold rounded-lg text-[11px] shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              Setup Firebase Live &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 mx-auto border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-500 font-medium">
              Loading student grievance portal...
            </p>
          </div>
        ) : !userProfile ? (
          /* Unauthenticated Landing State */
          <div className="py-12 sm:py-16 max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                <span>Campus Grievance Redressal & Resolution System</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Transparent & Rapid Student Complaint Management
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                A modern digital platform enabling students to submit grievances across academic, hostel, and campus infrastructure departments with real-time status tracking.
              </p>
            </div>

            {/* Role Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
              {/* Student Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Student Portal</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Submit campus complaints, track status changes (Pending, In Progress, Resolved), and view official administrative updates.
                  </p>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Student Sign In / Register</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Admin Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Administration Portal</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Grievance cell officers can manage all complaints, update resolution stages, and post official action remarks.
                  </p>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-black text-white rounded-xl font-bold text-xs shadow-md shadow-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Administrator Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : userProfile.role === 'admin' ? (
          /* Admin Dashboard */
          <AdminDashboard key={refreshKey} />
        ) : (
          /* Student Dashboard */
          <StudentDashboard
            key={refreshKey}
            onOpenNewComplaintModal={() => setIsComplaintModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/70 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} Campus Complaint Register System. All rights reserved.</span>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setIsSetupGuideOpen(true)}
              className="text-indigo-600 hover:underline cursor-pointer"
            >
              Firebase Setup & Security Rules
            </button>
            <span className="text-slate-300">•</span>
            <span>Cloud Firestore Secured</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ComplaintFormModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        onSuccess={handleComplaintSuccess}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <FirebaseSetupGuide
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
