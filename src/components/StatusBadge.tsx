import React from 'react';
import { ReportStatus } from '../types';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const styles: Record<ReportStatus, string> = {
    'Reported': 'bg-amber-50 text-amber-800 border-amber-200',
    'Under Review': 'bg-blue-50 text-blue-800 border-blue-200',
    'In Progress': 'bg-purple-50 text-purple-800 border-purple-200',
    'Resolved': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'Rejected': 'bg-rose-50 text-rose-800 border-rose-200',
    'Duplicate': 'bg-zinc-100 text-zinc-700 border-zinc-300',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${styles[status]} ${sizeClasses[size]} tracking-wide`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {status}
    </span>
  );
};
