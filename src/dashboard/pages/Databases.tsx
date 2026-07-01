import React from "react";
import EmptyState from "../components/EmptyState";
import { Database } from "lucide-react";

export default function Databases() {
  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Database Clusters</h2>
        <p className="text-xs text-zinc-500 font-medium">Create separate MariaDB, MySQL, or PostgreSQL schemas instantly.</p>
      </div>

      <EmptyState
        title="No databases configured"
        description="Database schemas let your server plugins and applications store data persistently. Databases are configured within individual servers."
        icon={Database}
        actionLabel="Go to Servers"
        onAction={() => {}}
      />
    </div>
  );
}
