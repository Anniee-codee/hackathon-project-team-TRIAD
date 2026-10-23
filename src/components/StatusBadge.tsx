import React from 'react';
import { ReportStatus } from '../types/raasta';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getColors = () => {
    switch (status) {
      case 'Reported':
        return 'bg-stone-100 text-stone-700 border-stone-300';
      case 'Under Review':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'In Progress':
        return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Rejected':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'Duplicate':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'Reported':
        return 'bg-stone-400';
      case 'Under Review':
        return 'bg-amber-500 animate-pulse';
      case 'In Progress':
        return 'bg-sky-500';
      case 'Resolved':
        return 'bg-emerald-600';
      case 'Rejected':
        return 'bg-rose-500';
      case 'Duplicate':
        return 'bg-purple-500';
      default:
        return 'bg-gray-400';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${getColors()} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`}></span>
      {status}
    </span>
  );
};
