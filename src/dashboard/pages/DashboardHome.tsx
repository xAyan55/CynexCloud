import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import StatCard from "../components/StatCard";
import DashboardCard from "../components/DashboardCard";
import ProgressBar from "../components/ProgressBar";
import SkeletonLoader from "../components/SkeletonLoader";
import { 
  Gamepad2, 
  HelpCircle, 
  Receipt, 
  Wallet, 
  Terminal, 
  Clock, 
  PlusCircle,
  Megaphone
} from "lucide-react";

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    servers: 0,
    tickets: 0,
    invoices: 0,
    balance: "$0.00"
  });

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        // Fetch real counts from backend APIs
        const serversRes = await fetch("/api/panel/servers");
        const ticketsRes = await fetch("/api/tickets");
        const keysRes = await fetch("/api/api-keys");

        const serversData = serversRes.ok ? await serversRes.json() : { servers: [] };
        const ticketsData = ticketsRes.ok ? await ticketsRes.json() : { tickets: [] };

        // Count pending invoices and filter open tickets
        const openTickets = (ticketsData.tickets || []).filter((t: any) => t.status !== "closed").length;

        setStats({
          servers: serversData.servers?.length || 0,
          tickets: openTickets,
          invoices: 1, // Mock pending invoice
          balance: "$15.50" // Mock credit balance
        });
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const quickActions = [
    { label: "Deploy Minecraft Server", path: "/dashboard/deploy", icon: Gamepad2 },
    { label: "Open Support Ticket", path: "/dashboard/support/create", icon: HelpCircle },
    { label: "Pay Due Invoices", path: "/dashboard/invoices", icon: Receipt }
  ];

  const recentActivity = [
    { action: "Account Registered", desc: "Successfully verified profile", time: "Just now", icon: Clock },
    { action: "Secure Session Started", desc: "Auth token family rotated", time: "5 minutes ago", icon: Terminal },
  ];

  const announcements = [
    { title: "Intel Core Ultra Nodes Active", desc: "New high-frequency game instances are now open for deployment in Central Europe.", date: "Today" },
    { title: "WAL DB Performance Tuning", desc: "Database query latency improved by 40% globally.", date: "Yesterday" }
  ];

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-8 select-none text-zinc-300 font-sans">
      {/* Welcome Greeting Row */}
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Welcome back, {user?.username}
        </h2>
        <p className="text-xs text-zinc-500 font-medium">
          CynexCloud account status is verified and active.
        </p>
      </div>

      {/* Stats Cards Row Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Active Servers" value={stats.servers} icon={Gamepad2} />
        <StatCard label="Open Tickets" value={stats.tickets} icon={HelpCircle} />
        <StatCard label="Pending Invoices" value={stats.invoices} icon={Receipt} />
        <StatCard label="Account Balance" value={stats.balance} icon={Wallet} />
      </div>

      {/* Quick Action Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Quick Actions & Usage */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="Quick Actions" subtitle="Configure and deploy services">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 pt-2">
              {quickActions.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => navigate(act.path)}
                    className="flex flex-col items-center justify-center p-5 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-white/[0.02] hover:border-zinc-700 text-center transition-all cursor-pointer group gap-3"
                  >
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">
                      {act.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </DashboardCard>

          {/* Core Resource Metrics */}
          <DashboardCard title="Aggregated Resource Usage" subtitle="Total compute usage across all running instances">
            <div className="space-y-4.5 pt-2">
              <ProgressBar value={stats.servers > 0 ? 34 : 0} label="CPU Core Allocation" sublabel={`${stats.servers > 0 ? "2" : "0"} / 8 Cores`} />
              <ProgressBar value={stats.servers > 0 ? 50 : 0} label="Memory Allocation" sublabel={`${stats.servers > 0 ? "4" : "0"} / 8 GB`} />
              <ProgressBar value={stats.servers > 0 ? 20 : 0} label="NVMe storage space" sublabel={`${stats.servers > 0 ? "20" : "0"} / 100 GB`} />
            </div>
          </DashboardCard>
        </div>

        {/* Right column: Activity & Announcements */}
        <div className="space-y-6">
          {/* Timeline Activity list */}
          <DashboardCard title="Recent Activity" subtitle="User account security log events">
            <div className="space-y-4 pt-2">
              {recentActivity.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div key={idx} className="flex gap-3 text-xs leading-normal">
                    <div className="p-1.5 h-fit rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-500 shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{act.action}</span>
                        <span className="text-[9px] font-semibold text-zinc-600">{act.time}</span>
                      </div>
                      <p className="text-zinc-500">{act.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </DashboardCard>

          {/* Announcements block */}
          <DashboardCard title="System Announcements" subtitle="Latest status alerts & system changes" headerAction={<Megaphone className="w-4 h-4 text-zinc-500" />}>
            <div className="space-y-4 pt-2">
              {announcements.map((ann, idx) => (
                <div key={idx} className="space-y-1.5 border-b border-zinc-800/40 last:border-0 pb-3 last:pb-0">
                  <div className="flex justify-between items-center">
                    <h5 className="text-xs font-bold text-white">{ann.title}</h5>
                    <span className="text-[9px] bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-zinc-500 font-bold uppercase tracking-wider">{ann.date}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal">{ann.desc}</p>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
