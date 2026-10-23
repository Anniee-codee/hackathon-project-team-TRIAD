import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ReportForm } from './components/ReportForm';
import { ReportExplorer } from './components/ReportExplorer';
import { ReportDetails } from './components/ReportDetails';
import { ModeratorDashboard } from './components/ModeratorDashboard';
import { Report } from './types/raasta';
import { getBackendConnectionStatus } from './services/reports';
import { isSupabaseConfigured } from './lib/supabase';
import { Database, AlertTriangle, CheckCircle, Server } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'explore' | 'details' | 'moderator'>('explore');
  const [selectedReference, setSelectedReference] = useState<string | null>(null);
  const [isModerator, setIsModerator] = useState<boolean>(() => {
    return localStorage.getItem('raasta_moderator_auth') === 'true';
  });

  const [dbStatus, setDbStatus] = useState<{
    mode: 'supabase' | 'offline_fallback';
    connected: boolean;
    tableVerified: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    getBackendConnectionStatus().then(setDbStatus);
  }, []);

  const handleSelectReport = (report: Report) => {
    setSelectedReference(report.reference);
    setActiveTab('details');
  };

  const handleReportCreated = (report: Report) => {
    setSelectedReference(report.reference);
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory-100 text-charcoal-900">
      <Navbar
        activeTab={activeTab === 'details' ? 'explore' : activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedReference(null);
        }}
        isModerator={isModerator}
        setIsModerator={setIsModerator}
      />

      {/* Schema Cache Alert Banner if Supabase URL is set but migration SQL is pending */}
      {isSupabaseConfigured && dbStatus && !dbStatus.tableVerified && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-900">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Supabase Schema Cache Alert:</strong> Table <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">public.reports</code> not found in Supabase project.
              </span>
            </div>
            <span className="text-[11px] text-amber-800">
              Run <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">supabase/migrations/001_core_report_and_history.sql</code> in the Supabase SQL Editor to activate cloud persistence.
            </span>
          </div>
        </div>
      )}

      <main className="flex-1">
        {activeTab === 'explore' && (
          <ReportExplorer
            onSelectReport={handleSelectReport}
            onNavigateToCreate={() => setActiveTab('report')}
          />
        )}

        {activeTab === 'report' && (
          <ReportForm
            onReportCreated={handleReportCreated}
            onNavigateToExplorer={() => {
              if (selectedReference) {
                setActiveTab('details');
              } else {
                setActiveTab('explore');
              }
            }}
          />
        )}

        {activeTab === 'details' && selectedReference && (
          <ReportDetails
            reference={selectedReference}
            onBack={() => {
              setSelectedReference(null);
              setActiveTab('explore');
            }}
          />
        )}

        {activeTab === 'moderator' && (
          <ModeratorDashboard
            onSelectReport={handleSelectReport}
          />
        )}
      </main>

      {/* Civic Footer with Backend-Core Status Indicator */}
      <footer className="border-t border-ivory-300 bg-ivory-50 py-5 text-xs text-charcoal-800/60 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-forest-800">Raasta Civic Platform</span>
            <span>•</span>
            <span>Team TRIAD Hackathon MVP</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>Branch: <code className="font-mono bg-ivory-200 px-1.5 py-0.5 rounded font-bold text-forest-800">backend-core</code></span>

            {/* Dynamic Database Status */}
            {dbStatus?.tableVerified ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>Supabase Cloud Connected</span>
              </span>
            ) : isSupabaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200" title={dbStatus?.message}>
                <Database className="w-3 h-3 text-amber-600" />
                <span>Supabase Table Pending (Run SQL)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-charcoal-800/70 font-medium bg-ivory-200 px-2 py-0.5 rounded-full">
                <Server className="w-3 h-3 text-charcoal-800/50" />
                <span>Offline-First Storage Active</span>
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
