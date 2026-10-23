import React, { useState, useEffect, useRef } from 'react';
import { Report, IssueCategory, ReportStatus, ISSUE_CATEGORIES, REPORT_STATUSES } from '../types/raasta';
import { StatusBadge } from './StatusBadge';
import { Map as MapIcon, List as ListIcon, Activity, ThumbsUp, Search, ExternalLink } from 'lucide-react';
import L from 'leaflet';

interface IssueMapExplorerProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  initialCategory?: string;
  initialSearch?: string;
  onConfirmIssue: (reportId: string) => void;
}

export const IssueMapExplorer: React.FC<IssueMapExplorerProps> = ({
  reports,
  onSelectReport,
  initialCategory = 'All categories',
  initialSearch = '',
  onConfirmIssue,
}) => {
  const [activeView, setActiveView] = useState<'map' | 'list' | 'pulse'>('map');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState<string>('All statuses');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter logic
  const filteredReports = reports.filter((r) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchRef = r.reference.toLowerCase().includes(q);
      const matchLoc = r.location_text.toLowerCase().includes(q);
      if (!matchTitle && !matchRef && !matchLoc) return false;
    }

    // Category
    if (selectedCategory !== 'All categories' && selectedCategory !== 'ALL') {
      if (r.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    }

    // Status
    if (selectedStatus !== 'All statuses' && selectedStatus !== 'ALL') {
      if (r.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
    }

    return true;
  });

  // Pulse sorted reports (exclude Resolved, Rejected, Duplicate per PRS)
  const pulseReports = [...reports]
    .filter((r) => r.status !== 'Resolved' && r.status !== 'Rejected' && r.status !== 'Duplicate')
    .sort((a, b) => {
      const scoreA = (a.confirmations_count || 0) * 3 + (a.status === 'Under Review' ? 6 : 4);
      const scoreB = (b.confirmations_count || 0) * 3 + (b.status === 'Under Review' ? 6 : 4);
      return scoreB - scoreA;
    });

  // Helper for marker pin color
  const getMarkerColor = (status: ReportStatus) => {
    switch (status) {
      case 'In Progress':
        return '#7C3AED';
      case 'Under Review':
        return '#2563EB';
      case 'Resolved':
        return '#166534';
      case 'Reported':
        return '#D97706';
      case 'Rejected':
        return '#4B5563';
      case 'Duplicate':
        return '#DC2626';
      default:
        return '#1B4D3E';
    }
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (activeView !== 'map') return;
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [29.8, 69.5],
        zoom: 5.4,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    // Update markers
    if (markersLayerRef.current && mapInstanceRef.current) {
      markersLayerRef.current.clearLayers();

      filteredReports.forEach((report) => {
        if (report.latitude && report.longitude) {
          const color = getMarkerColor(report.status);
          const icon = L.divIcon({
            className: 'report-map-pin',
            html: `
              <div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.35); cursor: pointer; transition: transform 0.2s;" title="${report.title}">
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          const marker = L.marker([report.latitude, report.longitude], { icon });

          const popupContent = `
            <div style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 2px;">
              <strong style="color: #1B4D3E; font-size: 14px; display: block; margin-bottom: 4px;">${report.title}</strong>
              <div style="color: #555; font-size: 11px; margin-bottom: 6px;">${report.category} • ${report.location_text}</div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                <span style="font-size: 11px; font-weight: 600; color: ${color}; border: 1px solid ${color}; padding: 1px 8px; border-radius: 12px;">${report.status}</span>
                <button id="view-${report.id}" style="background: #1B4D3E; color: white; border: none; border-radius: 6px; padding: 3px 8px; font-size: 11px; cursor: pointer;">Details</button>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          marker.on('popupopen', () => {
            const btn = document.getElementById(`view-${report.id}`);
            if (btn) {
              btn.onclick = () => onSelectReport(report);
            }
          });

          markersLayerRef.current?.addLayer(marker);
        }
      });
    }
  }, [activeView, filteredReports]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 animate-fade-in space-y-6">
      {/* Title */}
      <h1 className="font-serif text-3xl font-bold text-[#1B4D3E]">
        Raasta Issue Map
      </h1>

      {/* Filter Bar matching screenshots */}
      <div className="bg-white/95 rounded-2xl p-3 sm:p-4 border border-[#DEE5E0] shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area, title or ref..."
              className="w-full px-4 py-2 rounded-xl bg-white border border-[#CBD5D0] text-sm text-[#1F2421] placeholder-[#8A9990] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E]"
            />
          </div>

          {/* Categories Dropdown */}
          <div className="relative min-w-[170px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#CBD5D0] text-sm text-[#1F2421] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E] appearance-none"
            >
              <option value="All categories">All categories</option>
              {ISSUE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#526359]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Statuses Dropdown */}
          <div className="relative min-w-[150px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#CBD5D0] text-sm text-[#1F2421] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E] appearance-none"
            >
              <option value="All statuses">All statuses</option>
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

        {/* View Toggle Buttons */}
        <div className="flex items-center gap-1.5 self-end lg:self-auto">
          <button
            onClick={() => setActiveView('map')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeView === 'map'
                ? 'bg-[#1B4D3E] text-white shadow-sm'
                : 'bg-[#EAA235] text-white hover:bg-[#D99125]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>

          <button
            onClick={() => setActiveView('list')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeView === 'list'
                ? 'bg-[#1B4D3E] text-white shadow-sm'
                : 'bg-[#EAA235] text-white hover:bg-[#D99125]'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" />
            <span>List</span>
          </button>

          <button
            onClick={() => setActiveView('pulse')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeView === 'pulse'
                ? 'bg-[#1B4D3E] text-white shadow-sm'
                : 'bg-[#EAA235] text-white hover:bg-[#D99125]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Pulse</span>
          </button>
        </div>
      </div>

      {/* Reports Count */}
      <div className="text-xs text-[#526359] font-medium px-1">
        {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
      </div>

      {/* VIEW 1: MAP */}
      {activeView === 'map' && (
        <div className="w-full h-[540px] rounded-2xl overflow-hidden border border-[#CBD5D0] shadow-sm relative bg-slate-100 z-0">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
      )}

      {/* VIEW 2: LIST (2-Column Grid matching Screenshot 6) */}
      {activeView === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report)}
              className="p-5 bg-white rounded-2xl border border-[#DEE5E0] shadow-sm hover:shadow-md hover:border-[#CBD5D0] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-base text-[#1B4D3E] group-hover:text-[#143C30] transition-colors leading-snug">
                    {report.title}
                  </h3>
                  <p className="text-xs text-[#73857B]">
                    {report.category} · {report.location_text} · {new Date(report.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <StatusBadge status={report.status} />
                </div>
              </div>
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="col-span-2 text-center py-12 text-[#73857B] text-sm">
              No reports match your filters. Try adjusting search or category.
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: PULSE (Ranked Priority Feed matching Screenshot 7) */}
      {activeView === 'pulse' && (
        <div className="space-y-3">
          {pulseReports.map((report, idx) => {
            const confirmedCount = report.confirmations_count || 0;
            const score = confirmedCount * 3 + (report.status === 'Under Review' ? 6 : 4);
            const rank = `#${idx + 1}`;

            return (
              <div
                key={report.id}
                className="p-4 sm:p-5 bg-white rounded-2xl border border-[#DEE5E0] shadow-sm flex items-center justify-between gap-4 transition-all hover:border-[#CBD5D0]"
              >
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                  {/* Rank */}
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1B4D3E] flex-shrink-0 w-10">
                    {rank}
                  </span>

                  {/* Title & Metadata */}
                  <div
                    onClick={() => onSelectReport(report)}
                    className="cursor-pointer min-w-0"
                  >
                    <h3 className="font-semibold text-sm sm:text-base text-[#1F2421] hover:text-[#1B4D3E] truncate">
                      {report.title}
                    </h3>
                    <p className="text-xs text-[#73857B] mt-0.5">
                      {report.location_text} · {confirmedCount} confirmed
                    </p>
                  </div>
                </div>

                {/* Score & Status Badge & Confirm Button */}
                <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
                  <span className="text-xs sm:text-sm font-semibold text-[#1F2421]">
                    Score {score}
                  </span>

                  <StatusBadge status={report.status} />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfirmIssue(report.id);
                    }}
                    className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                      report.has_confirmed
                        ? 'bg-[#1B4D3E] text-white border-[#1B4D3E]'
                        : 'bg-white hover:bg-emerald-50 text-[#1B4D3E] border-[#DEE5E0]'
                    }`}
                    title={report.has_confirmed ? 'You confirmed this affects you' : 'Confirm this affects you too'}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {report.has_confirmed ? 'Affects me' : 'Affects me too'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}

          {pulseReports.length === 0 && (
            <div className="text-center py-12 text-[#73857B] text-sm">
              No active community pulse reports at the moment.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
