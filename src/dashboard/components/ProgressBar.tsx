import React from "react";

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  sublabel?: string;
}

export default function ProgressBar({ value, max = 100, label, sublabel }: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  // Decide color based on severity (minimalist: white/yellow/red)
  const barColor = percentage > 90 
    ? "bg-red-500" 
    : percentage > 70 
      ? "bg-yellow-500" 
      : "bg-white";

  return (
    <div className="space-y-1.5 select-none w-full">
      {(label || sublabel) && (
        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          {label && <span>{label}</span>}
          {sublabel && <span className="text-zinc-400 font-mono">{sublabel}</span>}
        </div>
      )}
      <div className="h-1.5 w-full bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
