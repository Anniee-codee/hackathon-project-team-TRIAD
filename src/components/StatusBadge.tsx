import React from 'react';
import { ReportStatus } from '../types/raasta';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyle = () => {
    switch (status) {
      case 'In Progress':
        return 'text-[#7C3AED] border-[#A78BFA] bg-[#FAF5FF]/70';
      case 'Under Review':
        return 'text-[#2563EB] border-[#60A5FA] bg-[#EFF6FF]/70';
      case 'Resolved':
        return 'text-[#166534] border-[#4ADE80] bg-[#F0FDF4]/70';
      case 'Reported':
        return 'text-[#D97706] border-[#FBBF24] bg-[#FFFBEB]/70';
      case 'Rejected':
        return 'text-[#4B5563] border-[#9CA3AF] bg-[#F9FAFB]/70';
      case 'Duplicate':
        return 'text-[#DC2626] border-[#F87171] bg-[#FEF2F2]/70';
      default:
        return 'text-[#4B5563] border-[#9CA3AF] bg-white';
    }
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-0.5 text-[11px] font-medium'
      : 'px-3.5 py-0.5 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border leading-tight ${getStyle()} ${sizeClasses}`}
    >
      {status}
    </span>
  );
};
