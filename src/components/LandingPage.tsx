import React, { useState } from 'react';
import { Camera, MapPin, Search, CheckSquare, Layers, Droplets, Trash2, Lightbulb, Wrench, ShieldAlert } from 'lucide-react';
import { Report } from '../types/raasta';
import { StatusBadge } from './StatusBadge';

interface LandingPageProps {
  reports: Report[];
  onNavigate: (tab: 'home' | 'map' | 'report' | 'moderator', filterCategory?: string, searchQuery?: string) => void;
  onSelectReport: (report: Report) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  reports,
  onNavigate,
  onSelectReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Compute stats
  const totalReports = reports.length;
  const activeReports = reports.filter(
    (r) => r.status === 'Reported' || r.status === 'Under Review' || r.status === 'In Progress'
  ).length;
  const resolvedReports = reports.filter((r) => r.status === 'Resolved').length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onNavigate('map', undefined, searchTerm.trim());
    } else {
      onNavigate('map');
    }
  };

  const categories = [
    { name: 'Roads & potholes', icon: Layers },
    { name: 'Drainage & sewage', icon: Droplets },
    { name: 'Garbage', icon: Trash2 },
    { name: 'Streetlights', icon: Lightbulb },
    { name: 'Water supply', icon: Droplets },
    { name: 'Other infrastructure', icon: Wrench },
  ];

  return (
    <div className="w-full pb-16 animate-fade-in">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Diorama with smooth floating animation */}
          <div className="lg:col-span-7 flex justify-center items-center relative order-2 lg:order-1">
            <div className="relative group w-full max-w-[560px]">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl transform group-hover:scale-105 transition-all duration-700" />
              <img
                src="/hero-diorama.png"
                alt="Raasta 3D City Diorama"
                className="w-full h-auto object-contain relative z-10 animate-float-slow drop-shadow-[0_20px_35px_rgba(27,77,62,0.22)] select-none pointer-events-none transition-transform duration-500"
              />
            </div>
          </div>

          {/* Hero Typography & CTAs */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 order-1 lg:order-2">
            <div className="space-y-1">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] font-black text-[#1B4D3E] leading-[1.08] tracking-tight">
                Your<br />
                Neighborhood.<br />
                Your Voice.<br />
                Better Streets.
              </h1>
            </div>

            <p className="text-sm sm:text-base text-[#2E3832] leading-relaxed max-w-md font-normal">
              Report potholes, overflowing drains, garbage and broken streetlights.
              See what others have reported nearby and follow every update in public.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('report')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1B4D3E] hover:bg-[#153D31] text-white font-medium text-sm shadow-md shadow-[#1B4D3E]/20 transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
              >
                <Camera className="w-4 h-4 text-emerald-300" />
                <span>Report an Issue</span>
              </button>

              <button
                onClick={() => onNavigate('map')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#EAA235] hover:bg-[#D99125] text-white font-medium text-sm shadow-md shadow-[#EAA235]/25 transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
              >
                <MapPin className="w-4 h-4 text-amber-100" />
                <span>Explore the map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar matching screenshot */}
        <div className="mt-8 max-w-xl">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <div className="absolute left-4 pointer-events-none text-[#73857B]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search area or issue..."
              className="w-full pl-11 pr-16 py-2.5 rounded-full bg-white/95 border border-[#DEE5E0] shadow-sm text-sm text-[#1F2421] placeholder-[#8A9990] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E]"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-1.5 rounded-full bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#153D31] transition-colors"
            >
              Go
            </button>
          </form>
        </div>
      </section>

      {/* Main Content Sections: How Raasta works & Latest reports */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: How Raasta works */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#1B4D3E]">
              How Raasta works
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 mt-0.5 rounded-full flex items-center justify-center text-[#1B4D3E]">
                  <Camera className="w-5 h-5 text-[#1B4D3E]" />
                </div>
                <p className="text-sm text-[#2E3832]">
                  Snap a photo, pick a category and drop a pin on the map.
                </p>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 mt-0.5 rounded-full flex items-center justify-center text-[#1B4D3E]">
                  <MapPin className="w-5 h-5 text-[#1B4D3E]" />
                </div>
                <p className="text-sm text-[#2E3832]">
                  Raasta shows similar reports nearby so you don't file a duplicate.
                </p>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 mt-0.5 rounded-full flex items-center justify-center text-[#1B4D3E]">
                  <CheckSquare className="w-5 h-5 text-[#1B4D3E]" />
                </div>
                <p className="text-sm text-[#2E3832]">
                  Moderators update the status — everyone sees the same public timeline.
                </p>
              </div>
            </div>

            {/* Counter Cards */}
            <div className="pt-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/90 rounded-xl p-4 text-center border border-[#E5E9E4] shadow-sm">
                  <div className="font-serif text-3xl font-bold text-[#1B4D3E]">
                    {totalReports}
                  </div>
                  <div className="text-xs text-[#526359] font-medium mt-1">Reports</div>
                </div>

                <div className="bg-white/90 rounded-xl p-4 text-center border border-[#E5E9E4] shadow-sm">
                  <div className="font-serif text-3xl font-bold text-[#1B4D3E]">
                    {activeReports}
                  </div>
                  <div className="text-xs text-[#526359] font-medium mt-1">Active</div>
                </div>

                <div className="bg-white/90 rounded-xl p-4 text-center border border-[#E5E9E4] shadow-sm">
                  <div className="font-serif text-3xl font-bold text-[#1B4D3E]">
                    {resolvedReports}
                  </div>
                  <div className="text-xs text-[#526359] font-medium mt-1">Resolved</div>
                </div>
              </div>
              <p className="text-[11px] text-[#73857B] mt-2">
                Across 4 cities - counted from reports in this demo.
              </p>
            </div>
          </div>

          {/* Right Column: Latest reports */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-serif text-2xl font-bold text-[#1B4D3E]">
                Latest reports
              </h2>
              <button
                onClick={() => onNavigate('map')}
                className="text-xs font-semibold text-[#1B4D3E] underline hover:text-[#153D31]"
              >
                view all
              </button>
            </div>

            <div className="space-y-3">
              {reports.slice(0, 4).map((report) => (
                <div
                  key={report.id}
                  onClick={() => onSelectReport(report)}
                  className="flex items-center justify-between p-3.5 bg-white/75 hover:bg-white rounded-xl border border-transparent hover:border-[#DDE3DF] hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="pr-3">
                    <h4 className="text-sm font-semibold text-[#1B4D3E] group-hover:text-[#143C30] transition-colors leading-snug">
                      {report.title}
                    </h4>
                    <p className="text-xs text-[#73857B] mt-0.5">
                      {report.location_text} - {new Date(report.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusBadge status={report.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* "What you can report" Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        <h2 className="font-serif text-2xl font-bold text-[#1B4D3E] mb-6">
          What you can report
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => onNavigate('map', cat.name)}
                className="flex items-center gap-4 p-5 bg-white/95 hover:bg-white rounded-2xl border border-[#E3E8E4] shadow-sm hover:shadow-md transition-all cursor-pointer group hover:translate-y-[-2px]"
              >
                <div className="w-12 h-12 rounded-xl bg-[#E8F3EE] flex items-center justify-center text-[#1B4D3E] group-hover:bg-[#1B4D3E] group-hover:text-white transition-colors flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-[#1B4D3E] underline group-hover:text-[#153D31]">
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
