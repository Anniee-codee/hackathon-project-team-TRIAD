import React, { useState, useEffect } from 'react';
import { Report, ReportStatus, REPORT_STATUSES } from '../types/raasta';
import { getReports, updateReportStatus } from '../services/reports';
import { StatusBadge } from './StatusBadge';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Clock,
  MapPin,
  ExternalLink,
  MessageSquare,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';

interface ModeratorDashboardProps {
  onSelectReport: (report: Report) => void;
}

export const ModeratorDashboard: React.FC<ModeratorDashboardProps> = ({
  onSelectReport,
}) => {
  // Passcode gate for demo moderator access
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('raasta_moderator_auth') === 'true';
  });
  const [accessCode, setAccessCode] = useState('');
  const [authError, setAuthError] = useState('');

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  // Selected report for status modal
  const [updatingReport, setUpdatingReport] = useState<Report | null>(null);
  const [targetStatus, setTargetStatus] = useState<ReportStatus>('Under Review');
  const [progressNote, setProgressNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default demo passcode
    if (accessCode.trim() === 'raasta2026' || accessCode.trim() === 'admin' || accessCode.trim() === 'moderator') {
      setIsAuthenticated(true);
      localStorage.setItem('raasta_moderator_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid Access Code. Use "raasta2026" or "admin" for evaluation.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('raasta_moderator_auth');
  };

  const loadModeratorReports = async () => {
    setIsLoading(true);
    try {
      const { reports: data } = await getReports({
        status: filterStatus,
        searchQuery: search,
      });
      setReports(data || []);
    } catch (err) {
      console.error('Error loading moderator reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadModeratorReports();
    }
  }, [isAuthenticated, filterStatus]);

  const handleOpenUpdateModal = (report: Report) => {
    setUpdatingReport(report);
    setTargetStatus(report.status);
    setProgressNote('');
    setSaveError('');
    setSaveSuccess('');
  };

  const handleSaveStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingReport) return;

    if (!progressNote.trim()) {
      setSaveError('Please enter a brief progress note or reason for this status change.');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      const { success, updatedReport, error } = await updateReportStatus({
        reportId: updatingReport.id,
        newStatus: targetStatus,
        message: progressNote.trim(),
        moderatorId: 'Officer (Officer ID #4092)',
      });

      if (!success || error) {
        setSaveError(error || 'Failed to update report status.');
      } else {
        setSaveSuccess(`Status successfully updated to "${targetStatus}".`);
        // Refresh local list
        setReports((prev) =>
          prev.map((r) => (r.id === updatingReport.id && updatedReport ? updatedReport : r))
        );
        setTimeout(() => {
          setUpdatingReport(null);
          setSaveSuccess('');
        }, 1200);
      }
    } catch (err: any) {
      setSaveError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-ivory-50 rounded-2xl p-6 sm:p-8 border border-ivory-300 shadow-sm text-center">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-charcoal-900 mb-1">
            Moderator Access Verification
          </h2>
          <p className="text-xs text-charcoal-800/70 mb-6">
            Authorized municipal officers only. Status changes are strictly audited and recorded with timestamps.
          </p>

          {authError && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter Staff Passcode (use 'raasta2026')"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 bg-ivory-100 text-charcoal-900 text-sm focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100 transition-all text-center"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Authenticate as Moderator</span>
            </button>
          </form>

          <p className="text-[11px] text-charcoal-800/50 mt-4">
            Hackathon Evaluator Notice: Passcode is pre-configured to <code className="bg-ivory-200 px-1 py-0.5 rounded font-mono">raasta2026</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-charcoal-900">
                Municipal Moderator Portal
              </h1>
              <span className="text-[11px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                FR-04 Authorized
              </span>
            </div>
            <p className="text-xs text-charcoal-800/70">
              Review citizen reports, dispatch field departments, and log official status updates to the audit trail.
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs text-charcoal-800/70 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-ivory-300 bg-ivory-50 transition-colors"
        >
          Sign Out of Portal
        </button>
      </div>

      {/* Filter / Search header */}
      <div className="bg-ivory-50 p-4 rounded-2xl border border-ivory-300 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-charcoal-800/60" />
          <span className="text-xs font-semibold text-charcoal-800 uppercase tracking-wider">Status Filter:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-ivory-300 bg-ivory-100 text-xs text-charcoal-800 focus:outline-none focus:border-amber-600"
          >
            <option value="ALL">All Statuses ({reports.length})</option>
            {REPORT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={loadModeratorReports}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ivory-300 bg-ivory-100 text-xs font-medium text-charcoal-800 hover:bg-ivory-200 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Reports Table */}
      {isLoading ? (
        <div className="py-20 text-center text-charcoal-800/60">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-2" />
          <p className="text-sm font-medium">Loading reports for review...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-ivory-50 rounded-2xl p-12 text-center border border-ivory-300">
          <p className="text-sm text-charcoal-800/70">No reports found under current filter.</p>
        </div>
      ) : (
        <div className="bg-ivory-50 rounded-2xl border border-ivory-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-200/80 text-charcoal-800 font-semibold uppercase tracking-wider border-b border-ivory-300">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Issue Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Moderator Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200 text-charcoal-800">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-ivory-100/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-forest-800 whitespace-nowrap">
                      {rep.reference}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-charcoal-900 truncate mb-0.5">{rep.title}</p>
                      <p className="text-[11px] text-charcoal-800/60 line-clamp-1">{rep.description}</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="bg-ivory-200 px-2 py-0.5 rounded text-[11px]">
                        {rep.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-[140px] truncate text-[11px]">
                      {rep.location_text}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={rep.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectReport(rep)}
                          className="px-2.5 py-1 text-xs text-charcoal-800 hover:text-forest-700 hover:bg-ivory-200 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleOpenUpdateModal(rep)}
                          className="px-3 py-1 text-xs font-semibold bg-forest-700 text-ivory-50 hover:bg-forest-800 rounded-lg shadow-sm transition-colors"
                        >
                          Update Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog for Status Change (FR-04) */}
      {updatingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/60 backdrop-blur-sm p-4">
          <div className="bg-ivory-50 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-ivory-300 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-ivory-200">
              <div>
                <span className="text-[11px] font-mono text-forest-800 font-bold bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                  {updatingReport.reference}
                </span>
                <h3 className="text-lg font-bold text-charcoal-900 mt-1">
                  Update Report Status
                </h3>
                <p className="text-xs text-charcoal-800/70 truncate max-w-sm">
                  {updatingReport.title}
                </p>
              </div>
              <StatusBadge status={updatingReport.status} size="sm" />
            </div>

            {saveSuccess && (
              <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStatusUpdate} className="space-y-4">
              {/* Select Status */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
                  New Status Transition <span className="text-rose-500">*</span>
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as ReportStatus)}
                  className="w-full px-4 py-2 rounded-xl border border-ivory-300 bg-ivory-100 text-charcoal-900 text-sm focus:outline-none focus:border-forest-700"
                >
                  {REPORT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st} {st === updatingReport.status ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Progress note */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
                  Official Progress Note / Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Field team dispatched to inspect damaged pipeline at 10:30 AM..."
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-ivory-300 bg-ivory-100 text-charcoal-900 text-sm focus:outline-none focus:border-forest-700"
                />
                <p className="text-[11px] text-charcoal-800/50 mt-1">
                  This note will be permanently added to the citizen-visible status history.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setUpdatingReport(null)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl border border-ivory-300 text-charcoal-800 text-xs font-medium hover:bg-ivory-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-forest-700 text-ivory-50 text-xs font-semibold hover:bg-forest-800 transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Commit Status Change</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
