import React from 'react';
import type { ComplaintStatus } from '../types';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const ComplaintStatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  switch (status) {
    case 'Pending':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses[size]}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
          Pending
        </span>
      );
    case 'In Progress':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 ${sizeClasses[size]}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
          In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses[size]}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Resolved
        </span>
      );
    default:
      return null;
  }
};
