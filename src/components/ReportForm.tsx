import React, { useState } from 'react';
import { CreateReportInput, ISSUE_CATEGORIES, IssueCategory, Report } from '../types/raasta';
import { createReport } from '../services/reports';
import { MapPin, AlertCircle, CheckCircle2, Copy, ArrowRight, Loader2, Navigation } from 'lucide-react';

interface ReportFormProps {
  onReportCreated: (report: Report) => void;
  onNavigateToExplorer: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  onReportCreated,
  onNavigateToExplorer,
}) => {
  const [formData, setFormData] = useState<CreateReportInput>({
    title: '',
    category: 'Roads & Potholes',
    location_text: '',
    description: '',
    latitude: null,
    longitude: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [createdReport, setCreatedReport] = useState<Report | null>(null);
  const [copied, setCopied] = useState(false);

  // Validate form
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.title.trim()) {
      errs.title = 'Title is required.';
    } else if (formData.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.';
    }

    if (!formData.category) {
      errs.category = 'Please choose a category.';
    }

    if (!formData.location_text.trim()) {
      errs.location_text = 'Location text or landmark is required.';
    } else if (formData.location_text.trim().length < 3) {
      errs.location_text = 'Please enter a valid area or landmark name.';
    }

    if (!formData.description.trim()) {
      errs.description = 'Problem description is required.';
    } else if (formData.description.trim().length < 10) {
      errs.description = 'Please describe the problem in at least 10 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const { report, error } = await createReport(formData);
      if (error) {
        setErrors({ form: error });
      } else {
        setCreatedReport(report);
        onReportCreated(report);
      }
    } catch (err: any) {
      setErrors({ form: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({ ...prev, location: 'Geolocation is not supported by your browser.' }));
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setErrors((prev) => ({ ...prev, location: 'Unable to retrieve location. Please enter area manually.' }));
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const copyReference = () => {
    if (createdReport) {
      navigator.clipboard.writeText(createdReport.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      {/* Receipt Modal upon successful submission */}
      {createdReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/60 backdrop-blur-sm p-4">
          <div className="bg-ivory-50 rounded-2xl max-w-md w-full p-6 shadow-xl border border-ivory-300 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-charcoal-900 mb-1">
              Issue Report Registered!
            </h3>
            <p className="text-sm text-charcoal-800/70 mb-6">
              Your civic report has been securely saved to the database. Save your reference code to monitor progress.
            </p>

            {/* Reference Card */}
            <div className="bg-ivory-200/80 rounded-xl p-4 border border-ivory-300 mb-6">
              <span className="text-xs uppercase font-semibold text-charcoal-800/60 tracking-wider block mb-1">
                Unique Tracking Reference
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-mono font-bold text-forest-800 tracking-wider">
                  {createdReport.reference}
                </span>
                <button
                  onClick={copyReference}
                  className="p-1.5 text-charcoal-800/60 hover:text-forest-700 hover:bg-ivory-300 rounded-lg transition-colors"
                  title="Copy reference"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied && (
                <span className="text-xs text-emerald-700 font-medium mt-1 inline-block">
                  Copied to clipboard!
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setCreatedReport(null);
                  setFormData({
                    title: '',
                    category: 'Roads & Potholes',
                    location_text: '',
                    description: '',
                    latitude: null,
                    longitude: null,
                  });
                }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-ivory-300 text-charcoal-800 text-sm font-medium hover:bg-ivory-200 transition-colors"
              >
                Submit Another
              </button>
              <button
                onClick={onNavigateToExplorer}
                className="flex-1 py-2.5 px-4 rounded-xl bg-forest-700 text-ivory-50 text-sm font-medium hover:bg-forest-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View in Explorer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-ivory-50 rounded-2xl p-6 sm:p-8 shadow-sm border border-ivory-300">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full mb-3">
            <span>FR-01: Citizen Submission</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-charcoal-900">
            Report a Civic Problem
          </h1>
          <p className="text-sm text-charcoal-800/70 mt-1">
            Highlight infrastructure, sanitation, or utility failures in your neighborhood for rapid moderator assessment.
          </p>
        </div>

        {errors.form && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
              Report Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Deep pothole causing vehicular damage"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border bg-ivory-100/50 text-charcoal-900 placeholder:text-charcoal-800/40 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-ivory-300 focus:border-forest-700 focus:ring-forest-100'
              }`}
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
              Issue Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as IssueCategory })}
              className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 bg-ivory-100/50 text-charcoal-900 text-sm focus:outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-100 transition-all"
            >
              {ISSUE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location Text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-charcoal-800 uppercase tracking-wider">
                Location or Landmark <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="text-xs text-forest-700 hover:text-forest-800 font-medium flex items-center gap-1 transition-colors"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Locating...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3 h-3" />
                    <span>Use My GPS</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-800/40">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="e.g. 5th Cross Road, opposite City Hospital"
                value={formData.location_text}
                onChange={(e) => setFormData({ ...formData, location_text: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-ivory-100/50 text-charcoal-900 placeholder:text-charcoal-800/40 text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.location_text
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-ivory-300 focus:border-forest-700 focus:ring-forest-100'
                }`}
              />
            </div>
            {errors.location_text && (
              <p className="text-xs text-rose-600 mt-1">{errors.location_text}</p>
            )}

            {formData.latitude && formData.longitude && (
              <p className="text-[11px] text-forest-700 font-mono mt-1">
                📍 Coordinates attached: {formData.latitude}, {formData.longitude}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5">
              Problem Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Provide specific details about the issue, severity, how long it has persisted, and any safety hazards..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border bg-ivory-100/50 text-charcoal-900 placeholder:text-charcoal-800/40 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.description
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-ivory-300 focus:border-forest-700 focus:ring-forest-100'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl bg-forest-700 text-ivory-50 font-semibold text-sm hover:bg-forest-800 focus:outline-none focus:ring-4 focus:ring-forest-200 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Database...</span>
                </>
              ) : (
                <span>Submit Civic Report</span>
              )}
            </button>
            <p className="text-center text-[11px] text-charcoal-800/50 mt-2">
              All submissions are timestamped and assigned an official tracking reference.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
