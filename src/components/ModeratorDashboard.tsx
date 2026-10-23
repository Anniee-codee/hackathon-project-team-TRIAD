import React, { useState } from 'react';
import { Report, ReportStatus, REPORT_STATUSES, ReportStatusHistory } from '../types/raasta';
import { StatusBadge } from './StatusBadge';
import { Search, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ModeratorDashboardProps {
  reports: Report[];
  onUpdateStatus: (reportId: string, newStatus: ReportStatus, note: string) => void;
  onOpenPublicPage: (report: Report) => void;
}

export const ModeratorDashboard: React.FC<ModeratorDashboardProps> = ({
  reports,
  onUpdateStatus,
  onOpenPublicPage,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('raasta_moderator_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    reports.length > 0 ? 'rst-1005' : null
  );
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Status update form state
  const [newStatus, setNewStatus] = useState<ReportStatus>('Under Review');
  const [progressNote, setProgressNote] = useState('');
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);

  // Authenticate handler
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === 'raasta2026') {
      setIsAuthenticated(true);
      localStorage.setItem('raasta_moderator_auth', 'true');
      setPinError(null);
    } else {
      setPinError('Invalid PIN. Use demo PIN: raasta2026');
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('raasta_moderator_auth');
  };

  // Filter reports
  const filteredReports = reports.filter((r) => {
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.reference.toLowerCase().includes(q) ||
        r.location_text.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedReport = reports.find((r) => r.id === selectedReportId);

  // Handle report selection
  const handleSelectReport = (r: Report) => {
    setSelectedReportId(r.id);
    setNewStatus(r.status);
    setProgressNote('');
    setUpdateFeedback(null);
  };

  // Handle status update
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    onUpdateStatus(selectedReport.id, newStatus, progressNote.trim());
    setUpdateFeedback(`Status updated to ${newStatus}`);
    setTimeout(() => setUpdateFeedback(null), 3000);
  };

  // 1. SIGN IN SCREEN (matching Screenshot 8)
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
        <div className="bg-white/95 rounded-2xl p-8 border border-[#DEE5E0] shadow-sm text-center space-y-5">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1B4D3E]">
              Moderator sign in
            </h1>
            <p className="text-xs text-[#526359] mt-2">
              Demo mode — PIN: <code className="bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold text-[#1B4D3E]">raasta2026</code>
            </p>
          </div>

          {pinError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {pinError}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4 pt-2">
            <div>
              <input
                type="text"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#CBD5D0] text-sm text-[#1F2421] placeholder-[#8A9990] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#1B4D3E] hover:bg-[#153D31] text-white font-semibold text-sm shadow-md shadow-[#1B4D3E]/20 transition-all"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. MODERATOR DASHBOARD (matching Screenshots 9, 10, 11)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 animate-fade-in space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-[#1B4D3E]">
          Moderator dashboard
        </h1>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 rounded-xl bg-[#EAA235] hover:bg-[#D99125] text-white font-semibold text-xs transition-colors shadow-sm"
        >
          Sign out
        </button>
      </div>

      {/* Split Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Search, filter & list */}
        <div className="lg:col-span-6 bg-white/95 rounded-2xl p-4 sm:p-5 border border-[#DEE5E0] shadow-sm space-y-3">
          {/* Search & Filter row */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#CBD5D0] text-xs text-[#1F2421] placeholder-[#8A9990] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E]"
              />
            </div>

            <div className="relative min-w-[130px]">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5D0] text-xs text-[#1F2421] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E] appearance-none"
              >
                <option value="All">All</option>
                {REPORT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#526359]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredReports.map((report) => {
              const isSelected = selectedReportId === report.id;
              return (
                <div
                  key={report.id}
                  onClick={() => handleSelectReport(report)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#E2EFE7] border-[#A8CEB8]'
                      : 'bg-white hover:bg-slate-50 border-[#E8ECE9]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-[#1F2421] truncate">
                      <span className="font-mono text-[#1B4D3E] mr-1.5 font-bold">
                        {report.reference}
                      </span>
                      {report.title}
                    </h4>
                    <p className="text-[11px] text-[#73857B] mt-0.5">
                      {report.location_text}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusBadge status={report.status} size="sm" />
                  </div>
                </div>
              );
            })}

            {filteredReports.length === 0 && (
              <div className="text-center py-10 text-xs text-[#73857B]">
                No reports match your filters.
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Selected report review */}
        <div className="lg:col-span-6 bg-white/95 rounded-2xl p-6 sm:p-7 border border-[#DEE5E0] shadow-sm min-h-[460px] flex flex-col justify-between">
          {selectedReport ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#1F2421] leading-snug">
                    {selectedReport.title}
                  </h2>
                  <p className="text-xs text-[#73857B] mt-1">
                    {selectedReport.reference} · {selectedReport.category} · {selectedReport.location_text}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <StatusBadge status={selectedReport.status} />
                </div>
              </div>

              <div className="text-xs sm:text-sm text-[#2E3832] font-normal leading-relaxed border-t border-b border-[#EEF2EF] py-3">
                {selectedReport.description}
              </div>

              {updateFeedback && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{updateFeedback}</span>
                </div>
              )}

              {/* Status Update Form */}
              <form onSubmit={handleUpdate} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">
                    Update status
                  </label>
                  <div className="relative">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5D0] text-sm text-[#1F2421] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E] appearance-none"
                    >
                      {REPORT_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#526359]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={4}
                    value={progressNote}
                    onChange={(e) => setProgressNote(e.target.value)}
                    placeholder="Public progress update"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5D0] text-sm text-[#1F2421] placeholder-[#8A9990] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E] resize-y"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#153D31] text-white font-medium text-xs shadow-md shadow-[#1B4D3E]/20 transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
                  >
                    Update status
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenPublicPage(selectedReport)}
                    className="text-xs font-semibold text-[#1B4D3E] hover:underline"
                  >
                    Open public page
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center py-20 text-[#73857B] text-sm">
              Select a report to review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
