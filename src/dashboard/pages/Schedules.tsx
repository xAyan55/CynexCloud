import React from "react";
import EmptyState from "../components/EmptyState";
import { Calendar } from "lucide-react";

export default function Schedules() {
  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Task Schedules</h2>
        <p className="text-xs text-zinc-500 font-medium">Automate cron restarts, command executions, and backups.</p>
      </div>

      <EmptyState
        title="No schedules active"
        description="Cron schedules let you execute recurring console commands or maintenance triggers. Open a server to edit schedules."
        icon={Calendar}
        actionLabel="Go to Servers"
        onAction={() => {}}
      />
    </div>
  );
}
