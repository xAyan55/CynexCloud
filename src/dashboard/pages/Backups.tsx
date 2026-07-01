import React from "react";
import EmptyState from "../components/EmptyState";
import { Archive } from "lucide-react";

export default function Backups() {
  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">System Backups</h2>
        <p className="text-xs text-zinc-500 font-medium">Create and manage snapshots of your virtual machines and Spigot allocations.</p>
      </div>

      <EmptyState
        title="No backups found"
        description="Backups allow you to save full restore points of your directories and databases. Select a server to generate a backup."
        icon={Archive}
        actionLabel="Go to Servers"
        onAction={() => {}}
      />
    </div>
  );
}
