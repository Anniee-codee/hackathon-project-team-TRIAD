import React, { useEffect, useRef } from 'react';
import { Report, ReportStatusHistory } from '../types/raasta';
import { StatusBadge } from './StatusBadge';
import { ArrowLeft, MapPin, Calendar, ThumbsUp, Clock, CheckCircle } from 'lucide-react';
import L from 'leaflet';

interface ReportDetailsProps {
  report: Report;
  history: ReportStatusHistory[];
  onBack: () => void;
  onConfirmIssue: (reportId: string) => void;
}

export const ReportDetails: React.FC<ReportDetailsProps> = ({
  report,
  history,
  onBack,
  onConfirmIssue,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!report.latitude || !report.longitude) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [report.latitude, report.longitude],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const markerIcon = L.divIcon({
        className: 'custom-pin',
        html: `
          <div style="background-color: #1B4D3E; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="background-color: #EAA235; width: 10px; height: 10px; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([report.latitude, report.longitude], { icon: markerIcon }).addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [report]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 animate-fade-in space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#1B4D3E] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to reports</span>
      </button>

      {/* Main Details Card */}
      <div className="bg-white/95 rounded-2xl p-6 sm:p-8 border border-[#DEE5E0] shadow-sm space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#F4F8F5] text-[#1B4D3E] border border-[#DEE5E0]">
                {report.reference}
              </span>
              <span className="text-xs text-[#73857B] font-medium">
                {report.category}
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#1F2421] leading-tight">
              {report.title}
            </h1>
            <p className="text-xs text-[#73857B] flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#1B4D3E]" />
              <span>{report.location_text}</span>
              <span>•</span>
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(report.created_at).toLocaleDateString('en-GB')}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={report.status} />

            <button
              onClick={() => onConfirmIssue(report.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                report.has_confirmed
                  ? 'bg-[#1B4D3E] text-white border-[#1B4D3E]'
                  : 'bg-white hover:bg-emerald-50 text-[#1B4D3E] border-[#DEE5E0]'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{report.has_confirmed ? 'Affects me' : 'This affects me too'}</span>
              <span className="ml-1 font-bold">({report.confirmations_count || 0})</span>
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="bg-[#FAFBF9] rounded-xl p-4 border border-[#EDF1EE] text-sm text-[#2E3832] leading-relaxed">
          {report.description}
        </div>

        {/* Location Map if coordinates available */}
        {report.latitude && report.longitude && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#73857B]">
              Pinned Location
            </h3>
            <div className="w-full h-56 rounded-xl overflow-hidden border border-[#CBD5D0]">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>
          </div>
        )}

        {/* Status History Timeline */}
        <div className="space-y-4 pt-2">
          <h3 className="font-serif text-xl font-bold text-[#1B4D3E] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#1B4D3E]" />
            <span>Public Status History</span>
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D5E2D9]">
            {history && history.length > 0 ? (
              history.map((hist, idx) => (
                <div key={hist.id || idx} className="relative group">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#1B4D3E] border-2 border-white shadow-sm flex items-center justify-center" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={hist.new_status} size="sm" />
                      <span className="text-[11px] text-[#73857B]">
                        {new Date(hist.created_at).toLocaleString('en-GB')}
                      </span>
                    </div>
                    {hist.message && (
                      <p className="text-xs text-[#2E3832] bg-white p-2.5 rounded-lg border border-[#E5EAE7] mt-1 shadow-2xs">
                        {hist.message}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-[#73857B]">
                Report logged and submitted by citizen.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
