import React, { useState } from 'react';
import { CreateReportInput, ReportCategory } from '../types';
import { createReport } from '../services/reportService';
import { Send, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReportFormProps {
  onSuccess: (reference: string) => void;
}

const CATEGORIES: ReportCategory[] = [
  'Pothole / Road Damage',
  'Water Supply & Leakage',
  'Garbage / Waste Disposal',
  'Streetlight / Electricity',
  'Sewage & Drainage',
  'Public Safety & Obstruction',
  'Other',
];

export const ReportForm: React.FC<ReportFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<CreateReportInput>({
    title: '',
    description: '',
    category: 'Pothole / Road Damage',
    location_text: '',
    latitude: null,
    longitude: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createReport(formData);
    setLoading(false);

    if (result.error || !result.data) {
      setError(result.error || 'Failed to file issue report.');
      return;
    }

    setSuccessRef(result.data.reference);
    onSuccess(result.data.reference);
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
      },
      (err) => {
        alert('Could not retrieve your coordinates: ' + err.message);
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900">Report a Civic Problem</h2>
        <p className="text-sm text-stone-600 mt-1">
          Submit issues in your neighborhood. Submissions are reviewed by authorized municipal moderators.
        </p>
      </div>

      {successRef && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-emerald-900">Report Submitted Successfully</h4>
            <p className="text-sm text-emerald-700 mt-0.5">
              Your issue reference is <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900">{successRef}</strong>.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
            Issue Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Broken water pipe leaking onto pavement"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ReportCategory })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Location / Landmark <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ring Road near Gate 4"
              value={formData.location_text}
              onChange={(e) => setFormData({ ...formData, location_text: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Optional GPS Coordinates
            </label>
            <button
              type="button"
              onClick={handleFetchLocation}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-medium inline-flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              Use Current Location
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              step="any"
              placeholder="Latitude (e.g. 25.3960)"
              value={formData.latitude ?? ''}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-mono"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude (e.g. 68.3578)"
              value={formData.longitude ?? ''}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Explain the issue, severity, and any hazards to traffic or public safety..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-medium rounded-lg shadow-sm transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-block animate-spin mr-2">◌</span>
          ) : (
            <Send className="w-4 h-4" />
          )}
          {loading ? 'Submitting to Database...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};
