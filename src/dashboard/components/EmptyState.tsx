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
    <div className="flex flex-col items-center justify-center text-center p-10 py-16 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-5 select-none">
      <div className="p-4 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-500">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1.5 w-full max-w-sm">
        <h4 className="text-base font-semibold text-white tracking-tight">{title}</h4>
        <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          variant="default"
          className="font-medium"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
