import React from 'react';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-zinc-900/90 rounded-md border border-zinc-800/40 ${className}`}
    />
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Banner Skeleton */}
      <Skeleton className="w-full h-44 sm:h-56 rounded-none" />

      {/* Info Section Skeleton */}
      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-5">
          {/* Avatar Skeleton */}
          <div className="p-1 rounded-full bg-zinc-950 inline-block w-fit">
            <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-full" />
          </div>
          {/* Action button skeleton */}
          <div className="self-end sm:self-auto">
            <Skeleton className="w-28 h-9 rounded-lg" />
          </div>
        </div>

        {/* User details skeletons */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Skeleton className="w-48 h-6 rounded" />
            <Skeleton className="w-32 h-4 rounded" />
          </div>
          <div className="space-y-2 pt-1 max-w-lg">
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-3/4 h-4 rounded" />
          </div>
          <div className="flex items-center gap-4 pt-2">
            <Skeleton className="w-28 h-4 rounded" />
            <Skeleton className="w-36 h-4 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const PostSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden p-5 space-y-4">
      {/* Author & Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="w-28 h-4 rounded" />
            <Skeleton className="w-20 h-3 rounded" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>

      {/* Title & Caption Skeleton */}
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-5 rounded" />
        <Skeleton className="w-full h-4 rounded" />
        <Skeleton className="w-2/3 h-4 rounded" />
      </div>

      {/* Image Skeleton */}
      <Skeleton className="w-full h-64 sm:h-80 rounded-lg" />

      {/* Footer / Meta Skeleton */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
        <Skeleton className="w-24 h-4 rounded" />
        <Skeleton className="w-16 h-4 rounded" />
      </div>
    </div>
  );
};

export const PostListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
};

export const PageSkeleton: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <Skeleton className="w-48 h-5 rounded" />
      <Skeleton className="w-32 h-3.5 rounded" />
    </div>
  );
};

export default Skeleton;
