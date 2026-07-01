import React from "react";
import DashboardCard from "../components/DashboardCard";
import { Megaphone, Calendar } from "lucide-react";

export default function Announcements() {
  const announcements = [
    {
      title: "Intel Core Ultra Nodes Active",
      category: "Network",
      desc: "New high-frequency game hosting instances are now active for deployments in Central Europe. Enjoy increased tickrates and faster start-times.",
      date: "July 1, 2026",
      author: "CynexCloud Network Team"
    },
    {
      title: "WAL DB Performance Tuning",
      category: "Maintenance",
      desc: "SQLite database layers have been tuned for WAL (Write-Ahead Logging) mode. User portal load speeds and background session rotations are now 40% faster.",
      date: "June 30, 2026",
      author: "CynexCloud System Team"
    },
    {
      title: "Google Google Visibility & Sitemap Launch",
      category: "Platform",
      desc: "Search engine crawl schemas, XML sitemaps, and robots configuration profiles have been fully optimized to expand public visibility of pricing tiers.",
      date: "June 29, 2026",
      author: "CynexCloud Marketing Team"
    }
  ];

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">System Announcements</h2>
        <p className="text-xs text-zinc-500 font-medium">Keep track of our system releases, platform improvements, and service status updates.</p>
      </div>

      <div className="space-y-5">
        {announcements.map((ann, idx) => (
          <div key={idx}>
            <DashboardCard
              title={ann.title}
              headerAction={
                <div className="flex items-center gap-1.5 text-zinc-500 font-bold uppercase tracking-wider text-[9px] bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-full">
                  <Calendar className="w-3 h-3" />
                  <span>{ann.date}</span>
                </div>
              }
            >
              <div className="space-y-4 pt-1">
                <span className="text-[9px] font-bold text-zinc-400 bg-white/[0.04] border border-zinc-800/80 px-2 py-0.5 rounded uppercase tracking-wider">
                  {ann.category}
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  {ann.desc}
                </p>
                <div className="text-[10px] text-zinc-650 font-bold flex justify-between items-center border-t border-zinc-800/40 pt-3">
                  <span>POSTED BY: {ann.author}</span>
                  <span>SYSTEM NOTIFICATION</span>
                </div>
              </div>
            </DashboardCard>
          </div>
        ))}
      </div>
    </div>
  );
}
