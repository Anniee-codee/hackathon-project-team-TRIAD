import React, { useState, useEffect } from 'react';
import { Report, IssueCategory, ReportStatus, ISSUE_CATEGORIES, REPORT_STATUSES } from '../types/raasta';
import { getReports } from '../services/reports';
import { StatusBadge } from './StatusBadge';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  ThumbsUp,
  AlertCircle,
  Loader2,
  ChevronRight,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

interface ReportExplorerProps {
  onSelectReport: (report: Report) => void;
  onNavigateToCreate: () => void;
}

export const ReportExplorer: React.FC<ReportExplorerProps> = ({
  onSelectReport,
  onNavigateToCreate,
}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'confirmations'>('newest');

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { reports: data, error: err } = await getReports({
        searchQuery,
        category: selectedCategory,
        status: selectedStatus,
        sortBy,
      });

      if (err) {
        setError(err);
      } else {
        setReports(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load reports.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedCategory, selectedStatus, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full mb-3">
            <span>FR-02: Public Report Explorer</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal-900">
            Community Reports & Issue Tracker
          </h1>
          <p className="text-sm text-charcoal-800/70 mt-1 max-w-xl">
            Discover verified municipal infrastructure issues submitted by citizens and monitor real-time maintenance progress.
          </p>
        </div>

        <button
          onClick={fetchReports}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-charcoal-800 text-sm font-medium hover:bg-ivory-200 transition-colors self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-forest-700' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-ivory-50 p-4 sm:p-5 rounded-2xl border border-ivory-300 shadow-sm mb-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-800/40" />
            <input
              type="text"
              placeholder="Search reports by title, description, landmark, or RST reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ivory-300 bg-ivory-100/50 text-charcoal-900 placeholder:text-charcoal-800/40 text-sm focus:outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-100 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-forest-700 text-ivory-50 text-sm font-semibold rounded-xl hover:bg-forest-800 transition-colors shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-ivory-200 text-xs">
          <div className="flex items-center gap-1.5 text-charcoal-800/60 font-semibold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-ivory-300 bg-ivory-100 text-charcoal-800 focus:outline-none focus:border-forest-700"
          >
            <option value="ALL">All Categories</option>
            {ISSUE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-ivory-300 bg-ivory-100 text-charcoal-800 focus:outline-none focus:border-forest-700"
          >
            <option value="ALL">All Statuses</option>
            {REPORT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-charcoal-800/60 font-semibold uppercase tracking-wider">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-ivory-300 bg-ivory-100 text-charcoal-800 focus:outline-none focus:border-forest-700"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="confirmations">Most Confirmed (Pulse)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List State Handling */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-charcoal-800/60">
          <Loader2 className="w-8 h-8 animate-spin text-forest-700 mb-3" />
          <p className="text-sm font-medium">Loading civic reports from database...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Failed to query database</p>
            <p className="mt-0.5 text-xs text-rose-700">{error}</p>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-ivory-50 rounded-2xl p-12 text-center border border-ivory-300 max-w-md mx-auto my-12">
          <div className="w-12 h-12 bg-ivory-200 text-charcoal-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-charcoal-900 mb-1">No Reports Found</h3>
          <p className="text-xs text-charcoal-800/70 mb-6">
            There are no issues matching your current search criteria. Try modifying your filters or submit a new report.
          </p>
          <button
            onClick={onNavigateToCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-700 text-ivory-50 text-sm font-semibold hover:bg-forest-800 transition-colors shadow-sm"
          >
            Submit First Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report)}
              className="group bg-ivory-50 p-5 rounded-2xl border border-ivory-300 hover:border-forest-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Reference + Status Header */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="font-mono text-xs font-semibold tracking-wider text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                    {report.reference}
                  </span>
                  <StatusBadge status={report.status} />
                </div>

                {/* Title */}
                <h3 className="font-bold text-base text-charcoal-900 group-hover:text-forest-800 transition-colors line-clamp-1 mb-1.5">
                  {report.title}
                </h3>

                {/* Description excerpt */}
                <p className="text-xs text-charcoal-800/70 line-clamp-2 mb-4 leading-relaxed">
                  {report.description}
                </p>
              </div>

              {/* Meta footer */}
              <div className="pt-3 border-t border-ivory-200 flex items-center justify-between text-xs text-charcoal-800/60">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-charcoal-800/40" />
                    <span className="truncate max-w-[140px]">{report.location_text}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-charcoal-800/40" />
                    <span>{formatDate(report.created_at)}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {(report.confirmations_count ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 text-[11px] font-medium">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{report.confirmations_count}</span>
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-charcoal-800/40 group-hover:text-forest-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
