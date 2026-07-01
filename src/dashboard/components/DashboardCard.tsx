import React, { ReactNode } from "react";
import { Skeleton } from "./SkeletonLoader";

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  loading?: boolean;
  className?: string;
}

export default function DashboardCard({ 
  title, 
  subtitle, 
  headerAction, 
  children, 
  loading = false,
  className = "" 
}: DashboardCardProps) {
  return (
    <div className={`bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 md:p-6 select-none transition-all duration-300 hover:translate-y-[-1px] ${className}`}>
      {/* Card Header */}
      {(title || headerAction) && (
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 pb-4 mb-4">
          <div className="space-y-0.5">
            {title && (
              <h4 className="text-sm font-bold text-white tracking-tight leading-none">
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest leading-none">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      {/* Card Body */}
      {loading ? (
        <div className="space-y-3 py-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
