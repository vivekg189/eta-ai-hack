"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%]",
        className
      )}
      style={{ animation: "shimmer-light 1.5s ease-in-out infinite", ...style }}
    />
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <div>
        <Skeleton className="w-24 h-8 rounded mb-1" />
        <Skeleton className="w-32 h-4 rounded" />
      </div>
      <Skeleton className="w-28 h-4 rounded" />
    </div>
  );
}

export function CardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="w-40 h-5 rounded" />
          <Skeleton className="w-56 h-3.5 rounded" />
        </div>
        <Skeleton className="w-20 h-7 rounded-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="w-full h-3.5 rounded" />
              <Skeleton className="w-3/4 h-3 rounded" />
            </div>
            <Skeleton className="w-12 h-5 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="w-44 h-5 rounded" />
          <Skeleton className="w-60 h-3.5 rounded" />
        </div>
        <Skeleton className="w-32 h-8 rounded-xl" />
      </div>
      <div className="flex items-center gap-6">
        <Skeleton className="w-44 h-44 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-4">
          {[80, 60, 40].map((w) => (
            <div key={w} className="space-y-1.5">
              <Skeleton className={`h-3.5 rounded`} style={{ width: `${w}%` }} />
              <Skeleton className="w-full h-2 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
