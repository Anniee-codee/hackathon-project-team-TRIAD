import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ReportForm } from './components/ReportForm';
import { ReportExplorer } from './components/ReportExplorer';
import { ReportDetails } from './components/ReportDetails';
import { ModeratorDashboard } from './components/ModeratorDashboard';
import { Report } from './types/raasta';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'explore' | 'details' | 'moderator'>('explore');
  const [selectedReference, setSelectedReference] = useState<string | null>(null);
  const [isModerator, setIsModerator] = useState<boolean>(() => {
    return localStorage.getItem('raasta_moderator_auth') === 'true';
  });

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

      {/* Civic Footer */}
      <footer className="border-t border-ivory-300 bg-ivory-50 py-6 text-xs text-charcoal-800/60 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-forest-800">Raasta Platform</span>
            <span>•</span>
            <span>Team TRIAD Hackathon MVP</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Branch: <code className="font-mono bg-ivory-200 px-1 py-0.5 rounded">backend-features</code></span>
            <span>Target: <code className="font-mono bg-ivory-200 px-1 py-0.5 rounded">integration</code></span>
            <span className="text-emerald-700 font-medium">● Local & Supabase RLS Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
