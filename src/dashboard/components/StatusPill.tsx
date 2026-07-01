import React from "react";

export type StatusType = "online" | "offline" | "starting" | "suspended" | "pending";

interface StatusPillProps {
  status: StatusType | string;
}

export default function StatusPill({ status }: StatusPillProps) {
  const currentStatus = status.toLowerCase() as StatusType;

  const config = {
    online: { label: "Online", dot: "bg-emerald-400" },
    offline: { label: "Offline", dot: "bg-red-500" },
    starting: { label: "Starting", dot: "bg-yellow-500" },
    suspended: { label: "Suspended", dot: "bg-amber-600" },
    pending: { label: "Pending", dot: "bg-zinc-400" }
  };

  const pill = config[currentStatus] || { label: status, dot: "bg-zinc-400" };

  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-bold text-zinc-300 select-none uppercase tracking-wider">
      <span className={`w-1.5 h-1.5 rounded-full ${pill.dot}`} />
      <span>{pill.label}</span>
    </div>
  );
}
