import React, { useState } from 'react';
import {
  X,
  Database,
  ShieldCheck,
  Server,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { isFirebaseConfigured } from '../firebase/config';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSetupGuide: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const envTemplate = `VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <Database className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Firebase Configuration & Setup</h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isFirebaseConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isFirebaseConfigured ? 'Connected' : 'Offline / Preview Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Complete guide to connect live Authentication & Cloud Firestore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Create Firebase Project & Enable Services
              </span>
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
              >
                <span>Firebase Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 pl-8 list-disc">
              <li>Open Firebase Console and click <strong>"Add Project"</strong>.</li>
              <li>Go to <strong>Authentication</strong> &gt; Click <strong>"Get Started"</strong> &gt; Enable <strong>Email/Password</strong> provider.</li>
              <li>Go to <strong>Cloud Firestore</strong> &gt; Click <strong>"Create Database"</strong> (select Production mode or Start in Test mode).</li>
              <li>Under Project Settings, add a <strong>Web App</strong> (&lt;/&gt;) to get your configuration credentials.</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Add Credentials to Local <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono text-xs">.env</code>
              </span>
              <button
                onClick={() => copyCode(envTemplate, 1)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 1 ? 'Copied!' : 'Copy Template'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-600 pl-8">
              Create a file named <code className="font-mono text-indigo-600 font-bold">.env</code> in the project root (<code className="font-mono text-xs">C:\Users\suniv\Downloads\My project\.env</code>) with your values:
            </p>
            <div className="pl-8">
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto">
                {envTemplate}
              </pre>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              Security Rules: Prevent Privilege Escalation
            </span>
            <p className="text-xs text-slate-600 pl-8 leading-relaxed">
              We have already prepared <code className="font-mono text-indigo-600">firestore.rules</code>. Deploy it to Firestore using the Firebase CLI:
            </p>
            <div className="pl-8">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono">
                <code>firebase deploy --only firestore:rules</code>
                <button
                  onClick={() => copyCode('firebase deploy --only firestore:rules', 2)}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-200/80 space-y-2">
            <span className="font-bold text-violet-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-violet-600" />
              How to Create Your First Admin User
            </span>
            <p className="text-xs text-violet-900 pl-7 leading-relaxed">
              Because public registration strictly sets <code className="bg-violet-200/60 px-1 py-0.5 rounded font-mono">role: 'student'</code> to prevent unauthorized administrative access:
            </p>
            <ol className="text-xs text-violet-800 space-y-1 pl-11 list-decimal">
              <li>Register an account normally using your email (e.g., <code className="font-mono">admin@campus.edu</code>).</li>
              <li>Go to <strong>Firebase Console &gt; Firestore Database &gt; users collection</strong>.</li>
              <li>Find your user document (matching your Auth UID) and change the field <code className="font-mono font-bold">role</code> from <code className="font-mono">"student"</code> to <code className="font-mono font-bold">"admin"</code>.</li>
              <li>Log out and log back in; your account now has full administrator privileges!</li>
            </ol>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-slate-600" />
              Deployment Instructions
            </span>
            <p className="text-xs text-slate-600 pl-7">
              To build and host your production app on Firebase Hosting:
            </p>
            <div className="pl-7 space-y-1.5 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 flex items-center justify-between">
                <span>npm run build</span>
                <button
                  onClick={() => copyCode('npm run build', 3)}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 flex items-center justify-between">
                <span>firebase deploy --only hosting</span>
                <button
                  onClick={() => copyCode('firebase deploy --only hosting', 4)}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedIndex === 4 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
