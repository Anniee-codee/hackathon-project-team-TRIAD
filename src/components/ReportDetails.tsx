import React, { useState, useEffect } from 'react';
import { Report, ReportStatusHistory } from '../types/raasta';
import { getReportByReference, toggleConfirmation } from '../services/reports';
import { StatusBadge } from './StatusBadge';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  ThumbsUp,
  Share2,
  Copy,
  CheckCircle2,
  History,
  AlertCircle,
  Loader2,
  User,
  Check
} from 'lucide-react';

interface ReportDetailsProps {
  reference: string;
  onBack: () => void;
  onStatusUpdated?: () => void;
}

export const ReportDetails: React.FC<ReportDetailsProps> = ({
  reference,
  onBack,
  onStatusUpdated,
}) => {
  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<ReportStatusHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate or retrieve persistent pseudo citizen ID for this browser session
  const [citizenId] = useState<string>(() => {
    let stored = localStorage.getItem('raasta_citizen_session_id');
    if (!stored) {
      stored = `citizen-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      localStorage.setItem('raasta_citizen_session_id', stored);
    }
    return stored;
  });

  const loadDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { report: rep, history: hist, error: err } = await getReportByReference(
        reference,
        citizenId
      );
      if (err || !rep) {
        setError(err || 'Report not found.');
      } else {
        setReport(rep);
        setHistory(hist);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve report details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [reference]);

  const handlePulseConfirm = async () => {
    if (!report || isConfirming) return;
    setIsConfirming(true);

    try {
      const { confirmed, newCount, error: pulseErr } = await toggleConfirmation(
        report.id,
        citizenId
      );

      if (pulseErr) {
        alert(pulseErr);
      } else {
        setReport({
          ...report,
          confirmations_count: newCount,
          has_confirmed: confirmed,
        });
      }
    } catch (err: any) {
      console.error('Pulse error:', err);
    } finally {
      setIsConfirming(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 flex flex-col items-center justify-center text-charcoal-800/60">
        <Loader2 className="w-8 h-8 animate-spin text-forest-700 mb-3" />
        <p className="text-sm font-medium">Fetching report {reference}...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-charcoal-900 mb-2">Report Not Found</h2>
        <p className="text-sm text-charcoal-800/70 mb-6">
          {error || `Unable to locate report with reference code "${reference}". Please check the reference code and try again.`}
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-700 text-ivory-50 text-sm font-semibold hover:bg-forest-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explorer</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-800/70 hover:text-forest-700 mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Explorer</span>
      </button>

      {/* Main Report Card */}
      <div className="bg-ivory-50 rounded-2xl p-6 sm:p-8 border border-ivory-300 shadow-sm mb-8">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-ivory-200">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold tracking-wider text-forest-800 bg-forest-100/70 px-3 py-1 rounded-lg border border-forest-200">
              {report.reference}
            </span>
            <StatusBadge status={report.status} size="lg" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ivory-300 bg-ivory-100 text-xs text-charcoal-800 font-medium hover:bg-ivory-200 transition-colors"
              title="Copy link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <div className="py-6 border-b border-ivory-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-1 rounded-md border border-forest-200 inline-block mb-3">
            {report.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 mb-4 leading-tight">
            {report.title}
          </h1>
          <p className="text-charcoal-800/80 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {report.description}
          </p>
        </div>

        {/* Location & Metadata */}
        <div className="py-6 border-b border-ivory-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal-800/80">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-charcoal-900 mb-0.5">Location Landmark</span>
              <span>{report.location_text}</span>
              {report.latitude && report.longitude && (
                <span className="block font-mono text-[11px] text-charcoal-800/60 mt-1">
                  GPS: {report.latitude}, {report.longitude}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-charcoal-900 mb-0.5">Submitted On</span>
              <span>{formatTimestamp(report.created_at)}</span>
              <span className="block text-[11px] text-charcoal-800/60 mt-1">
                Last updated: {formatTimestamp(report.updated_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Raasta Pulse Action (FR-05) */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-forest-50/50 p-4 rounded-xl border border-forest-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-forest-900">Raasta Pulse</span>
              <span className="text-[11px] bg-forest-100 text-forest-800 font-semibold px-2 py-0.5 rounded-full border border-forest-200">
                Community Impact
              </span>
            </div>
            <p className="text-xs text-charcoal-800/70 mt-0.5">
              Confirm if this problem also impacts your daily commute or neighborhood.
            </p>
          </div>

          <button
            onClick={handlePulseConfirm}
            disabled={isConfirming}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              report.has_confirmed
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-ivory-50 text-forest-800 border border-forest-300 hover:bg-forest-100'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${report.has_confirmed ? 'fill-current' : ''}`} />
            <span>{report.has_confirmed ? 'Affects Me Too (Confirmed)' : 'This Affects Me Too'}</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-black/10 text-xs">
              {report.confirmations_count || 0}
            </span>
          </button>
        </div>
      </div>

      {/* Chronological Status History Timeline (FR-03 & FR-04) */}
      <div className="bg-ivory-50 rounded-2xl p-6 sm:p-8 border border-ivory-300 shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 bg-forest-100 text-forest-700 rounded-lg">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-charcoal-900">
              Official Status History & Audit Trail
            </h2>
            <p className="text-xs text-charcoal-800/60">
              Chronological records of municipal verification and field actions.
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-charcoal-800/60 py-4 text-center">
            No status history recorded yet.
          </p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-forest-200">
            {history.map((hist, idx) => (
              <div key={hist.id || idx} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-forest-700 border-4 border-ivory-50 group-hover:scale-110 transition-transform shadow-sm"></div>

                <div className="bg-ivory-100/70 p-4 rounded-xl border border-ivory-200 group-hover:border-forest-300 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-charcoal-900">
                        {hist.old_status ? (
                          <>
                            <span className="text-charcoal-800/60 line-through mr-1">{hist.old_status}</span>
                            <span>→</span>
                            <span className="ml-1 font-bold text-forest-800">{hist.new_status}</span>
                          </>
                        ) : (
                          <span className="font-bold text-forest-800">Initial Submission</span>
                        )}
                      </span>
                      <StatusBadge status={hist.new_status} size="sm" />
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-charcoal-800/60 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(hist.created_at)}</span>
                    </div>
                  </div>

                  {hist.message && (
                    <p className="text-xs text-charcoal-800/80 leading-relaxed bg-ivory-50 p-2.5 rounded-lg border border-ivory-200/80 mb-2">
                      “{hist.message}”
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-charcoal-800/50">
                    <User className="w-3 h-3" />
                    <span>Logged by: {hist.changed_by || 'Municipal Moderator'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
