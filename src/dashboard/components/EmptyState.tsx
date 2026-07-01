import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ title, description, icon: Icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-14 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-4 select-none animate-fade-in">
      <div className="p-3.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-500">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1 w-full max-w-[280px]">
        <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
        <p className="text-xs text-zinc-500 leading-normal">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold text-[11px] py-1.5 px-4 h-auto rounded-lg transition-colors border-none"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
