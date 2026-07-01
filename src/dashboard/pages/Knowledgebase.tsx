import React, { useState } from "react";
import DashboardCard from "../components/DashboardCard";
import { Search, BookOpen, ChevronRight, FileText } from "lucide-react";

export default function Knowledgebase() {
  const [searchQuery, setSearchQuery] = useState("");

  const articles = [
    { title: "Connecting via SFTP to your Minecraft Server", category: "Game Servers", desc: "Learn how to use SFTP tools like FileZilla to upload maps, plugins, and server mods securely." },
    { title: "Pointing custom domains via DNS records", category: "Domains & DNS", desc: "A guide on linking external domain names to VPS allocations using A/AAAA and CNAME settings." },
    { title: "Securing your Linux VPS with SSH keys", category: "VPS Hosting", desc: "Improve virtual server safety by disabling password access and enforcing SSH private keys." },
    { title: "Configuring BungeeCord / Waterfall Proxies", category: "Game Servers", desc: "Step-by-step tutorial on linking multiple Spigot subservers together under a single network gateway." }
  ];

  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Knowledgebase</h2>
          <p className="text-xs text-zinc-500 font-medium">Browse articles, configuration guides, and self-help tutorials.</p>
        </div>
        <div className="relative w-full sm:max-w-xs shrink-0">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((art, idx) => (
            <div 
              key={idx}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 hover:bg-white/[0.01] transition-all flex flex-col justify-between cursor-pointer group space-y-4"
            >
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">
                  {art.category}
                </span>
                <h4 className="text-xs font-bold text-white group-hover:text-white transition-colors">
                  {art.title}
                </h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                  {art.desc}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-650 group-hover:text-zinc-400 transition-colors pt-2 border-t border-zinc-800/30">
                <span>READ GUIDE</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <DashboardCard>
              <div className="text-center py-12 text-zinc-500 space-y-3">
                <FileText className="w-8 h-8 mx-auto text-zinc-700" />
                <div>
                  <p className="text-xs font-semibold text-white">No articles matched "{searchQuery}"</p>
                  <p className="text-[10px] text-zinc-600 mt-1">Try another keywords like "SFTP", "VPS", or "SSH".</p>
                </div>
              </div>
            </DashboardCard>
          </div>
        )}
      </div>
    </div>
  );
}
