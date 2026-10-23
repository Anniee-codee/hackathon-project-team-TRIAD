import React from 'react';
import { ShieldCheck, PlusCircle, Compass, ShieldAlert, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'report' | 'explore' | 'moderator';
  setActiveTab: (tab: 'report' | 'explore' | 'moderator') => void;
  isModerator: boolean;
  setIsModerator: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isModerator,
  setIsModerator,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-ivory-100/90 backdrop-blur-md border-b border-ivory-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('explore')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center text-ivory-50 shadow-sm group-hover:bg-forest-800 transition-colors">
            <span className="font-bold text-lg tracking-wider">रा</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-forest-800">Raasta</span>
              <span className="text-xs bg-forest-100 text-forest-700 font-semibold px-2 py-0.5 rounded-full border border-forest-200">
                Civic Pulse
              </span>
            </div>
            <p className="text-[11px] text-charcoal-800/60 leading-none hidden sm:block">
              Community-Powered Civic Reporting
            </p>
          </div>
        </div>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'explore'
                ? 'bg-forest-700 text-ivory-50 shadow-sm'
                : 'text-charcoal-800 hover:bg-ivory-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'report'
                ? 'bg-forest-700 text-ivory-50 shadow-sm'
                : 'bg-forest-50 text-forest-800 border border-forest-200 hover:bg-forest-100'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-forest-600" />
            <span>Report Issue</span>
          </button>

          {/* Moderator Portal Toggle */}
          <button
            onClick={() => {
              setActiveTab('moderator');
              if (!isModerator) setIsModerator(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ml-1 ${
              activeTab === 'moderator'
                ? 'bg-amber-600 text-white shadow-sm'
                : isModerator
                ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                : 'text-charcoal-800 hover:bg-ivory-200'
            }`}
            title="Moderator Portal"
          >
            {isModerator ? (
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-charcoal-800/70" />
            )}
            <span className="hidden md:inline">
              {isModerator ? 'Moderator Mode' : 'Staff Portal'}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};
