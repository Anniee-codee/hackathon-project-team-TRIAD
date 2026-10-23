import React, { useState } from 'react';
import { ReportForm } from './components/ReportForm';
import { ReportExplorer } from './components/ReportExplorer';
import { ReportDetails } from './components/ReportDetails';
import { ModeratorDashboard } from './components/ModeratorDashboard';
import { Shield, PlusCircle, Search, Compass } from 'lucide-react';
import { isSupabaseConfigured } from './lib/supabase';

type Tab = 'home' | 'report' | 'explore' | 'moderator';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedReportRef, setSelectedReportRef] = useState<string | null>(null);

  const handleOpenReport = (reference: string) => {
    setSelectedReportRef(reference);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#212529]">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            onClick={() => {
              setActiveTab('home');
              setSelectedReportRef(null);
            }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              R
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-stone-900">Raasta</span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded ml-2 uppercase">
                Civic Pulse
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => {
                setActiveTab('explore');
                setSelectedReportRef(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'explore'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Issues</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('report');
                setSelectedReportRef(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'report'
                  ? 'bg-emerald-800 text-white'
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('moderator');
                setSelectedReportRef(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'moderator'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Moderator</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Supabase Status Banner */}
      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-900 font-medium">
          Running in local offline-first persistent mode. Provide <code className="bg-white/80 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> in your <code className="bg-white/80 px-1 py-0.5 rounded">.env</code> to connect directly to your live Supabase cloud database.
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {selectedReportRef ? (
          <ReportDetails
            reference={selectedReportRef}
            onBack={() => setSelectedReportRef(null)}
          />
        ) : activeTab === 'home' ? (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center max-w-2xl mx-auto pt-6 pb-2">
              <span className="text-xs uppercase tracking-widest font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Community-Powered Civic Reporting
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 mt-4 tracking-tight leading-tight">
                Fixing our streets and neighborhoods together.
              </h1>
              <p className="text-stone-600 text-base mt-4 leading-relaxed">
                Report potholes, water leakages, broken streetlights, or waste accumulation in seconds. Track municipal progress in real time with an open audit trail.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setActiveTab('report')}
                  className="px-5 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold shadow-sm flex items-center gap-2 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  File a Civic Report
                </button>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-5 py-3 rounded-xl bg-white border border-stone-300 hover:border-stone-400 text-stone-800 text-sm font-semibold shadow-sm flex items-center gap-2 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Browse Active Reports
                </button>
              </div>
            </div>

            {/* Quick Stats / Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm mb-3">
                  1
                </div>
                <h3 className="font-bold text-stone-900 text-sm">Citizen Reporting</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Submit with category, location details, and automatic unique reference tracking.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm mb-3">
                  2
                </div>
                <h3 className="font-bold text-stone-900 text-sm">Transparent Timeline</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Full chronological audit history from Report filed to Under Review, In Progress, and Resolved.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm mb-3">
                  3
                </div>
                <h3 className="font-bold text-stone-900 text-sm">Moderator Control</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Authorized dashboard for officials to triage, dispatch teams, and update live statuses.
                </p>
              </div>
            </div>

            {/* Recent issues preview */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-stone-900">Recent Community Reports</h2>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="text-xs font-semibold text-emerald-800 hover:underline"
                >
                  View All →
                </button>
              </div>
              <ReportExplorer onSelectReport={handleOpenReport} />
            </div>
          </div>
        ) : activeTab === 'report' ? (
          <ReportForm
            onSuccess={(ref) => {
              setSelectedReportRef(ref);
            }}
          />
        ) : activeTab === 'explore' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-stone-900">Community Issue Explorer</h2>
              <p className="text-xs text-stone-500 mt-1">
                Filter and track local problems reported by fellow citizens.
              </p>
            </div>
            <ReportExplorer onSelectReport={handleOpenReport} />
          </div>
        ) : (
          <ModeratorDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            <strong>Raasta</strong> — Civic Issue Reporting MVP &bull; Team TRIAD
          </div>
          <div>
            Branch: <span className="font-mono text-emerald-800 font-semibold">backend-core</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
