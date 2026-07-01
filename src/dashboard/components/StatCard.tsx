import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendType?: "up" | "down";
}

export default function StatCard({ label, value, icon: Icon, trend, trendType }: StatCardProps) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex items-start justify-between select-none">
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
          {label}
        </span>
        <h3 className="text-2xl font-bold text-white tracking-tight leading-none">
          {value}
        </h3>
        {trend && (
          <span className={`text-[10px] font-bold flex items-center gap-1 ${
            trendType === "up" ? "text-emerald-400" : "text-red-400"
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400">
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
}
