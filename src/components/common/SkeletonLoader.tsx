import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-shimmer bg-[#2A1B24]/5 rounded-xl ${className}`} />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white shadow-app rounded-2xl p-6 space-y-4 border border-[#2A1B24]/5">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-12 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white shadow-app rounded-2xl border border-[#2A1B24]/5 p-6 space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-[#2A1B24]/10">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-[#2A1B24]/5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
};
