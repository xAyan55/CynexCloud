import React from "react";
import DashboardCard from "../components/DashboardCard";
import { Clock, Shield, Key, Terminal, CreditCard, HelpCircle } from "lucide-react";

export default function Activity() {
  const logs = [
    { id: 1, action: "API Token Revoked", desc: "Access key cc_key_f293b revoked by user", time: "1 hour ago", icon: Key },
    { id: 2, action: "Support Ticket Closed", desc: "Ticket TCK-894 closed by user", time: "Yesterday at 4:32 PM", icon: HelpCircle },
    { id: 3, action: "Invoice Settled", desc: "Payment of $15.00 completed successfully", time: "June 28, 2026", icon: CreditCard },
    { id: 4, action: "Session Terminated", desc: "Revoked active device session from 192.168.1.1", time: "June 25, 2026", icon: Shield },
    { id: 5, action: "Minecraft Server Deployed", desc: "Created Spigot instance under Node EU-GER-01", time: "June 24, 2026", icon: Terminal },
    { id: 6, action: "Profile Password Changed", desc: "Security hashes updated in database.ts", time: "June 20, 2026", icon: Shield }
  ];

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Security Audit Logs</h2>
        <p className="text-xs text-zinc-500 font-medium">Review a comprehensive timeline of administrative changes, login attempts, and key actions.</p>
      </div>

      <DashboardCard>
        <div className="relative border-l border-zinc-800 ml-4.5 pl-6.5 space-y-6.5 pt-2 pb-4">
          {logs.map(log => {
            const Icon = log.icon;
            return (
              <div key={log.id} className="relative text-xs leading-normal">
                {/* Timeline circle icon indicator */}
                <div className="absolute -left-[38px] top-0 p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-500 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                
                <div className="space-y-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="font-bold text-white text-xs">{log.action}</span>
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">{log.time}</span>
                  </div>
                  <p className="text-zinc-500 font-medium">{log.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </DashboardCard>
    </div>
  );
}
