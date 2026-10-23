import React, { useState, useEffect, useRef } from 'react';
import { IssueCategory, ISSUE_CATEGORIES, Report } from '../types/raasta';
import { MapPin, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import L from 'leaflet';

interface ReportFormProps {
  onReportCreated: (newReport: Report) => void;
  onNavigateToMap: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  onReportCreated,
  onNavigateToMap,
}) => {
  const [category, setCategory] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 31.4187,
    lng: 73.0791,
  });
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successReport, setSuccessReport] = useState<Report | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Custom marker icon
    const markerIcon = L.divIcon({
      className: 'custom-pin',
      html: `
        <div style="background-color: #1B4D3E; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <div style="background-color: #EAA235; width: 8px; height: 8px; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    const map = L.map(mapContainerRef.current, {
      center: [30.3753, 69.3451], // Center of Pakistan
      zoom: 5,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Initial pin
    if (selectedCoords) {
      markerRef.current = L.marker([selectedCoords.lat, selectedCoords.lng], {
        icon: markerIcon,
      }).addTo(map);
    }

    // Map click handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setSelectedCoords({ lat, lng });

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!category) {
      setError('Please select an issue category.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a descriptive title.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe the issue in detail.');
      return;
    }
    if (!locationText.trim()) {
      setError('Please provide the area or landmark address.');
      return;
    }

    // Generate reference RST-100X
    const refNum = 1007 + Math.floor(Math.random() * 899);
    const newReference = `RST-${refNum}`;

    const newReport: Report = {
      id: `rst-${refNum}`,
      reference: newReference,
      title: title.trim(),
      description: description.trim(),
      category: category as IssueCategory,
      location_text: locationText.trim(),
      latitude: selectedCoords ? selectedCoords.lat : null,
      longitude: selectedCoords ? selectedCoords.lng : null,
      status: 'Reported',
      created_by: 'citizen-current',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      confirmations_count: 0,
      has_confirmed: false,
    };

    onReportCreated(newReport);
    setSuccessReport(newReport);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 animate-fade-in">
      {successReport ? (
        <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 border border-[#E0E7E2] shadow-md text-center space-y-5 animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle className="w-9 h-9" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#1B4D3E]">
              Report Filed Successfully!
            </h3>
            <p className="text-sm text-[#526359] mt-1">
              Your issue reference has been assigned and published to the community map.
            </p>
          </div>
          <div className="p-4 bg-[#F4F8F5] rounded-xl border border-[#D5E5DA]">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#526359]">
              Reference Code
            </span>
            <div className="font-serif text-2xl font-bold text-[#1B4D3E] mt-0.5">
              {successReport.reference}
            </div>
            <div className="text-xs text-[#2E3832] font-medium mt-1">
              {successReport.title}
            </div>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => {
                setSuccessReport(null);
                setTitle('');
                setDescription('');
                setLocationText('');
                setCategory('');
                setPhotoName(null);
              }}
              className="px-4 py-2 rounded-lg bg-white border border-[#CCD8D0] text-[#1B4D3E] text-sm font-medium hover:bg-[#F4F8F5]"
            >
              Submit another
            </button>
            <button
              onClick={onNavigateToMap}
              className="px-5 py-2 rounded-lg bg-[#1B4D3E] text-white text-sm font-medium hover:bg-[#153D31] shadow-sm"
            >
              View on Issue Map
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Form Card */}
          <div className="lg:col-span-6 bg-white/95 rounded-2xl p-6 sm:p-7 border border-[#DEE5E0] shadow-sm">
            <h1 className="font-serif text-3xl font-bold text-[#1B4D3E] mb-6">
              Report an issue
            </h1>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#CBD5D0] text-sm text-[#1F2421] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E] appearance-none"
                  >
                    <option value="">Select...</option>
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
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep pothole outside bakery"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#CBD5D0] text-sm text-[#1F2421] placeholder-[#8A9990] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#CBD5D0] text-sm text-[#1F2421] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E] resize-y"
                />
              </div>

              {/* Area / Address */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">
                  Area / address
                </label>
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="e.g. Block 6, Gulshan-e-Iqbal, Karachi"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#CBD5D0] text-sm text-[#1F2421] placeholder-[#8A9990] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E]"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1.5">
                  Photo (JPG/PNG, max 3 MB)
                </label>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-[#CBD5D0] bg-white">
                  <label className="cursor-pointer px-3 py-1 bg-[#EEF2EF] hover:bg-[#E2E8E4] rounded text-xs font-medium text-[#2E3832] transition-colors">
                    Choose file
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setPhotoName(file.name);
                      }}
                    />
                  </label>
                  <span className="text-xs text-[#73857B] truncate">
                    {photoName || 'No file chosen'}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#1B4D3E] hover:bg-[#153D31] text-white font-semibold text-sm shadow-md shadow-[#1B4D3E]/20 transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
                >
                  Submit report
                </button>
              </div>
            </form>
          </div>

          {/* Right: Leaflet Map */}
          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#1F2421] font-medium px-1">
              <span>Click the map to mark the exact location</span>
              {selectedCoords && (
                <span className="text-[11px] text-[#73857B]">
                  {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
                </span>
              )}
            </div>

            <div className="w-full h-[480px] rounded-2xl overflow-hidden border border-[#CBD5D0] shadow-sm relative bg-slate-100 z-0">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
