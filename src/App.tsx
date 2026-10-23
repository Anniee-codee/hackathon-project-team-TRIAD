import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { IssueMapExplorer } from './components/IssueMapExplorer';
import { ReportForm } from './components/ReportForm';
import { ModeratorDashboard } from './components/ModeratorDashboard';
import { ReportDetails } from './components/ReportDetails';
import { Footer } from './components/Footer';
import { Report, ReportStatus, ReportStatusHistory } from './types/raasta';
import { INITIAL_REPORTS, INITIAL_STATUS_HISTORY } from './data/mockReports';

const STORAGE_REPORTS_KEY = 'raasta_frontend_reports_v2';
const STORAGE_HISTORY_KEY = 'raasta_frontend_history_v2';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'report' | 'moderator' | 'details'>('home');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All categories');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persistent reports state
  const [reports, setReports] = useState<Report[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REPORTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading reports from localStorage', e);
    }
    return INITIAL_REPORTS;
  });

  // Persistent history state
  const [statusHistory, setStatusHistory] = useState<Record<string, ReportStatusHistory[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading history from localStorage', e);
    }
    return INITIAL_STATUS_HISTORY;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(reports));
    } catch (e) {
      console.error('Failed to save reports', e);
    }
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(statusHistory));
    } catch (e) {
      console.error('Failed to save status history', e);
    }
  }, [statusHistory]);

  // Handle report creation
  const handleReportCreated = (newReport: Report) => {
    const updated = [newReport, ...reports];
    setReports(updated);

    const initialHistoryEntry: ReportStatusHistory = {
      id: `h-${Date.now()}`,
      report_id: newReport.id,
      old_status: null,
      new_status: 'Reported',
      changed_by: 'citizen',
      message: 'Report filed and submitted to community map.',
      created_at: new Date().toISOString(),
    };

    setStatusHistory((prev) => ({
      ...prev,
      [newReport.id]: [initialHistoryEntry],
    }));
  };

  // Handle moderator status update
  const handleUpdateStatus = (reportId: string, newStatus: ReportStatus, note: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            status: newStatus,
            updated_at: new Date().toISOString(),
          };
        }
        return r;
      })
    );

    const historyEntry: ReportStatusHistory = {
      id: `h-${Date.now()}`,
      report_id: reportId,
      old_status: reports.find((r) => r.id === reportId)?.status || null,
      new_status: newStatus,
      changed_by: 'moderator',
      message: note || `Status updated to ${newStatus}`,
      created_at: new Date().toISOString(),
    };

    setStatusHistory((prev) => ({
      ...prev,
      [reportId]: [...(prev[reportId] || []), historyEntry],
    }));

    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport((prev) =>
        prev ? { ...prev, status: newStatus, updated_at: new Date().toISOString() } : null
      );
    }
  };

  // Handle community pulse confirmation
  const handleConfirmIssue = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const wasConfirmed = !!r.has_confirmed;
          const currentCount = r.confirmations_count || 0;
          return {
            ...r,
            has_confirmed: !wasConfirmed,
            confirmations_count: wasConfirmed ? Math.max(0, currentCount - 1) : currentCount + 1,
          };
        }
        return r;
      })
    );

    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport((prev) => {
        if (!prev) return null;
        const wasConfirmed = !!prev.has_confirmed;
        const currentCount = prev.confirmations_count || 0;
        return {
          ...prev,
          has_confirmed: !wasConfirmed,
          confirmations_count: wasConfirmed ? Math.max(0, currentCount - 1) : currentCount + 1,
        };
      });
    }
  };

  // Navigation helper
  const handleNavigate = (
    tab: 'home' | 'map' | 'report' | 'moderator',
    category?: string,
    search?: string
  ) => {
    setActiveTab(tab);
    if (category) setFilterCategory(category);
    if (search !== undefined) setSearchQuery(search);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#90C8DD] via-[#D5ECF5] to-[#FAF8F3] text-[#1F2421]">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'map') {
            setFilterCategory('All categories');
            setSearchQuery('');
          }
        }}
      />

      {/* Main Pages */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <LandingPage
            reports={reports}
            onNavigate={handleNavigate}
            onSelectReport={(r) => {
              setSelectedReport(r);
              setActiveTab('details');
            }}
          />
        )}

        {activeTab === 'map' && (
          <IssueMapExplorer
            reports={reports}
            initialCategory={filterCategory}
            initialSearch={searchQuery}
            onSelectReport={(r) => {
              setSelectedReport(r);
              setActiveTab('details');
            }}
            onConfirmIssue={handleConfirmIssue}
          />
        )}

        {activeTab === 'report' && (
          <ReportForm
            onReportCreated={handleReportCreated}
            onNavigateToMap={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'moderator' && (
          <ModeratorDashboard
            reports={reports}
            onUpdateStatus={handleUpdateStatus}
            onOpenPublicPage={(r) => {
              setSelectedReport(r);
              setActiveTab('details');
            }}
          />
        )}

        {activeTab === 'details' && selectedReport && (
          <ReportDetails
            report={reports.find((r) => r.id === selectedReport.id) || selectedReport}
            history={statusHistory[selectedReport.id] || []}
            onBack={() => setActiveTab('map')}
            onConfirmIssue={handleConfirmIssue}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
