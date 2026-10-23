import React, { useState, useEffect } from 'react';
import { Report, ReportCategory, ReportStatus, FilterOptions } from '../types';
import { getReports } from '../services/reportService';
import { StatusBadge } from './StatusBadge';
import { Search, Filter, MapPin, ArrowRight } from 'lucide-react';

interface ReportExplorerProps {
  onSelectReport: (reference: string) => void;
}

const CATEGORIES: (ReportCategory | 'ALL')[] = [
  'ALL',
  'Pothole / Road Damage',
  'Water Supply & Leakage',
  'Garbage / Waste Disposal',
  'Streetlight / Electricity',
  'Sewage & Drainage',
  'Public Safety & Obstruction',
  'Other',
];

const STATUSES: (ReportStatus | 'ALL')[] = [
  'ALL',
  'Reported',
  'Under Review',
  'In Progress',
  'Resolved',
  'Rejected',
  'Duplicate',
];

export const ReportExplorer: React.FC<ReportExplorerProps> = ({ onSelectReport }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    category: 'ALL',
    status: 'ALL',
  });

  const loadData = async () => {
    setLoading(true);
    const res = await getReports(filters);
    setReports(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Search & Filters Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by keywords, location, or report reference..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <div className="flex items-center gap-1.5 text-stone-600 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value as ReportCategory | 'ALL' })}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-stone-600 font-medium ml-2">
            <span>Status:</span>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as ReportStatus | 'ALL' })}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Statuses' : s}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFilters({ searchQuery: '', category: 'ALL', status: 'ALL' })}
            className="text-stone-500 hover:text-stone-800 ml-auto text-xs underline font-medium"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
          <div className="inline-block animate-spin text-stone-400 text-2xl mb-2">◌</div>
          <p className="text-sm text-stone-500">Loading live civic reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
          <p className="text-base font-medium text-stone-700">No reports found</p>
          <p className="text-xs text-stone-500 mt-1">Try modifying your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report.reference)}
              className="bg-white rounded-xl border border-stone-200/90 p-5 hover:border-emerald-700/60 hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {report.reference}
                  </span>
                  <StatusBadge status={report.status} size="sm" />
                </div>
                <h3 className="font-bold text-stone-900 text-base leading-snug line-clamp-2">
                  {report.title}
                </h3>
                <p className="text-xs text-stone-600 mt-1.5 line-clamp-2">
                  {report.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-1 truncate max-w-[65%]">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span className="truncate">{report.location_text}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-800 font-semibold hover:underline">
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
