import React from 'react';

interface NavbarProps {
  activeTab: 'home' | 'map' | 'report' | 'moderator' | 'details';
  setActiveTab: (tab: 'home' | 'map' | 'report' | 'moderator') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-[#87BFD5]/40 to-transparent backdrop-blur-md pt-3 pb-2 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo matching screenshot */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-full bg-[#1B4D3E] flex items-center justify-center shadow-md shadow-[#1B4D3E]/20 transition-transform group-hover:scale-105">
            {/* Stylized road icon inside circle */}
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19L10 5" stroke="#F59E0B" strokeWidth="2.5" />
              <path d="M20 19L14 5" stroke="#F59E0B" strokeWidth="2.5" />
              <line x1="12" y1="8" x2="12" y2="10" stroke="white" strokeWidth="2" strokeDasharray="1 3" />
              <line x1="12" y1="14" x2="12" y2="16" stroke="white" strokeWidth="2" strokeDasharray="1 3" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-black tracking-wider text-xl leading-none text-[#1B4D3E]">
              RAASTA
            </span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#2C6955] uppercase mt-0.5">
              BETTER STREETS
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'map'
                ? 'bg-white/85 text-[#1B4D3E] shadow-sm font-semibold'
                : 'text-[#1F2421]/80 hover:text-[#1B4D3E] hover:bg-white/40'
            }`}
          >
            Issue Map
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'report'
                ? 'bg-white/85 text-[#1B4D3E] shadow-sm font-semibold'
                : 'text-[#1F2421]/80 hover:text-[#1B4D3E] hover:bg-white/40'
            }`}
          >
            Report
          </button>

          <button
            onClick={() => setActiveTab('moderator')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'moderator'
                ? 'bg-white/85 text-[#1B4D3E] shadow-sm font-semibold'
                : 'text-[#1F2421]/80 hover:text-[#1B4D3E] hover:bg-white/40'
            }`}
          >
            Moderator
          </button>
        </nav>
      </div>
    </header>
  );
};
