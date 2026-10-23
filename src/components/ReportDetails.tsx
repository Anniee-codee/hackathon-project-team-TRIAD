import React, { useState, useEffect } from 'react';
import { Report, ReportStatusHistory } from '../types';
import { getReportByReference, getReportHistory } from '../services/reportService';
import { StatusBadge } from './StatusBadge';
import { ArrowLeft, MapPin, Calendar, Clock, AlertTriangle } from 'lucide-react';

interface ReportDetailsProps {
  reference: string;
  onBack: () => void;
}

export const ReportDetails: React.FC<ReportDetailsProps> = ({ reference, onBack }) => {
  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<ReportStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setNotFound(false);
      const repRes = await getReportByReference(reference);

      if (!repRes.data || repRes.error) {
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setReport(repRes.data);
      }

      const histRes = await getReportHistory(repRes.data.id);
      if (isMounted) {
        setHistory(histRes.data);
        setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [reference]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center bg-white rounded-2xl border border-stone-200">
        <div className="inline-block animate-spin text-stone-400 text-3xl mb-3">◌</div>
        <p className="text-stone-600 text-sm">Loading report details and status timeline...</p>
      </div>
    );
  }

  if (notFound || !report) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
        <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-stone-900">Report Not Found</h3>
        <p className="text-stone-600 text-sm mt-1 mb-6">
          No civic report was found with reference <span className="font-mono font-semibold text-stone-800">{reference}</span>.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800"
        >
          Return to Explorer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Reports
      </button>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-stone-100">
          <div>
            <span className="font-mono text-sm font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {report.reference}
            </span>
            <span className="ml-3 text-xs text-stone-500 font-medium">
              Category: <strong className="text-stone-800">{report.category}</strong>
            </span>
          </div>
          <StatusBadge status={report.status} size="lg" />
        </div>

        <h1 className="text-2xl font-bold text-stone-900 mt-5 leading-tight">
          {report.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 mt-3 pb-5 border-b border-stone-100">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-stone-400" />
            <span className="font-medium text-stone-800">{report.location_text}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-stone-400" />
            <span>Reported {new Date(report.created_at).toLocaleDateString()}</span>
          </div>
          {report.latitude && report.longitude && (
            <div className="text-stone-400 font-mono">
              GPS: {report.latitude}, {report.longitude}
            </div>
          )}
        </div>

        <div className="mt-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
            Description
          </h4>
          <p className="text-stone-800 text-sm leading-relaxed whitespace-pre-wrap">
            {report.description}
          </p>
        </div>
      </div>

      {/* Status History Timeline */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-sm">
        <h3 className="text-base font-bold text-stone-900 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-700" />
          Status History & Progress Timeline
        </h3>

        {history.length === 0 ? (
          <p className="text-xs text-stone-500">No status logs recorded yet.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
            {history.map((item) => (
              <div key={item.id} className="relative group">
                {/* Dot */}
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white bg-emerald-700 shadow-sm flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>

                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/70">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.new_status} size="sm" />
                      {item.old_status && (
                        <span className="text-xs text-stone-400">
                          (from {item.old_status})
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-stone-400">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                  {item.message && (
                    <p className="text-xs text-stone-700 mt-2 font-medium">
                      "{item.message}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
