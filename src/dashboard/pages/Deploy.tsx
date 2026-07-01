import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../components/DashboardCard";
import { Button } from "@/components/ui/button";
import { Gamepad2, Server, Globe } from "lucide-react";

export default function Deploy() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans max-w-2xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Order New Service</h2>
        <p className="text-xs text-zinc-500 font-medium">To maintain strict provisioning integrity, services must be ordered via storefront billing pipelines.</p>
      </div>

      <DashboardCard title="Storefront Catalog" subtitle="Select a category to view high-performance plans">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-2">
          <div 
            onClick={() => window.location.href = "/minecraft"}
            className="flex flex-col items-center justify-center p-8 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-white/[0.01] hover:border-zinc-700 text-center transition-all cursor-pointer group gap-4"
          >
            <div className="p-3.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-500 group-hover:text-white transition-colors">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Minecraft Hosting</span>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Browse Game Plans</span>
            </div>
          </div>

          <div 
            onClick={() => window.location.href = "/vps"}
            className="flex flex-col items-center justify-center p-8 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-white/[0.01] hover:border-zinc-700 text-center transition-all cursor-pointer group gap-4"
          >
            <div className="p-3.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-500 group-hover:text-white transition-colors">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Linux Cloud VPS</span>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Browse Virtual Servers</span>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
