import React from 'react';

export const StatCardSkeleton = () => (
  <div className="card-p h-[104px] bg-white border border-gray-100 flex items-center gap-4 animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0"></div>
    <div className="space-y-2 flex-1">
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  </div>
);

export const JobCardSkeleton = () => (
  <div className="card-p flex items-center gap-4 bg-white border border-gray-100 animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0"></div>
    <div className="flex-1 space-y-2.5">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      <div className="flex gap-2 pt-1">
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      </div>
    </div>
    <div className="w-20 h-8 bg-gray-200 rounded-md"></div>
  </div>
);
