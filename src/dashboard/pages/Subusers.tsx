import React from "react";
import EmptyState from "../components/EmptyState";
import { Users } from "lucide-react";

export default function Subusers() {
  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Account Subusers</h2>
        <p className="text-xs text-zinc-500 font-medium">Grant other accounts custom read or write access to your running instances.</p>
      </div>

      <EmptyState
        title="No subusers active"
        description="Share administrative access with developers or co-owners safely without sharing passwords. Subusers are managed inside server details."
        icon={Users}
        actionLabel="Go to Servers"
        onAction={() => {}}
      />
    </div>
  );
}
