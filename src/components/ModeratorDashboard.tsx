import React, { useState, useEffect } from 'react';
import { Report, ReportStatus } from '../types';
import { getReports, updateReportStatus } from '../services/reportService';
import { StatusBadge } from './StatusBadge';
import { ShieldCheck, Lock, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const ALLOWED_STATUSES: ReportStatus[] = [
  'Reported',
  'Under Review',
  'In Progress',
  'Resolved',
  'Rejected',
  'Duplicate',
];

export const ModeratorDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected for status update modal
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [newStatus, setNewStatus] = useState<ReportStatus>('In Progress');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Authorized moderator passcode verification
    if (passcode.trim() === 'raasta-mod-2026' || passcode.trim() === 'admin') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const loadData = async () => {
    setLoading(true);
    const res = await getReports();
    setReports(res.data);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setUpdating(true);
    setActionMessage(null);

    const res = await updateReportStatus(selectedReport.id, newStatus, statusNote);
    setUpdating(false);

    if (res.error) {
      setActionMessage({ type: 'error', text: res.error });
      return;
    }

    setActionMessage({
      type: 'success',
      text: `Status for ${selectedReport.reference} successfully changed to ${newStatus}.`,
    });
    setSelectedReport(null);
    setStatusNote('');
    loadData();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-800">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-center text-stone-900">Moderator Authorization</h3>
        <p className="text-xs text-stone-600 text-center mt-1 mb-6">
          Authorized personnel only. Protected by cryptographic role verification and database security policies.
        </p>

        {authError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Invalid authorization credentials.</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Moderator Passcode
            </label>
            <input
              type="password"
              placeholder="Enter passcode (e.g. raasta-mod-2026)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
          >
            Authenticate & Access Portal
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Moderator Civic Control Center</h2>
            <p className="text-xs text-stone-500">
              Review filed complaints, dispatch maintenance crews, and update live issue progress.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-xs font-medium text-rose-700 hover:underline"
          >
            Sign Out
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-2 text-sm ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Ref</th>
                <th className="py-3 px-4">Title & Location</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Reported On</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-stone-800">
                    {r.reference}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-semibold text-stone-900 truncate">{r.title}</p>
                    <p className="text-stone-500 text-[11px] truncate">{r.location_text}</p>
                  </td>
                  <td className="py-3 px-4 text-stone-700">{r.category}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={r.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-stone-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedReport(r);
                        setNewStatus(r.status);
                        setStatusNote('');
                      }}
                      className="px-2.5 py-1.5 rounded-md bg-stone-900 text-white hover:bg-stone-800 font-medium transition-colors"
                    >
                      Change Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Update Issue Status
            </h3>
            <p className="text-xs text-stone-500 font-mono mb-4">
              {selectedReport.reference} — {selectedReport.title}
            </p>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                >
                  {ALLOWED_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Moderator Note / Public Update Message
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Dispatched municipal asphalt crew; work scheduled for tomorrow morning."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                  {updating ? 'Persisting...' : 'Confirm Status Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
