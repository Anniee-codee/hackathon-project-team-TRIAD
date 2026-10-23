import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-[#DEE5E0] bg-white/70 backdrop-blur-sm py-8 px-4 sm:px-8 text-xs text-[#526359]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left */}
        <div className="space-y-1">
          <div className="font-semibold text-[#1F2421]">© 2026 Raasta</div>
          <p className="text-[11px] text-[#73857B]">
            Citizen-powered civic reporting for Pakistan.
          </p>
        </div>

        {/* Center */}
        <div className="space-y-1">
          <div className="font-semibold text-[#1F2421]">Demo mode</div>
          <p className="text-[11px] text-[#73857B]">
            Reports are saved in this browser only. No official government integration.
          </p>
        </div>

        {/* Right */}
        <div className="md:text-right space-y-1">
          <p className="text-[11px] text-[#73857B]">
            Map data © OpenStreetMap contributors
          </p>
        </div>
      </div>
    </footer>
  );
};
