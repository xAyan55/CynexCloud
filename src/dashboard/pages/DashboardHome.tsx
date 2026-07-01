import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Clock, 
  Megaphone
} from "lucide-react";

export default function DashboardHome() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    services: 0,
    tickets: 0,
    invoices: 0,
    balance: "₹0.00"
  });

  const [resources, setResources] = useState({
    cpu: 0,
    ram: 0,
    disk: 0
  });

  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        // Fetch real counts from backend APIs
        const servicesRes = await authFetch("/api/services");
        const ticketsRes = await authFetch("/api/tickets");
        const activityRes = await authFetch("/api/auth/activity");
        const plansRes = await authFetch("/api/plans");

        const servicesData = servicesRes.ok ? await servicesRes.json() : { services: [] };
        const ticketsData = ticketsRes.ok ? await ticketsRes.json() : { tickets: [] };
        const activityData = activityRes.ok ? await activityRes.json() : { logs: [] };
        const plansData = plansRes.ok ? await plansRes.json() : [];

        // Count pending invoices and filter open tickets
        const openTickets = (ticketsData.tickets || []).filter((t: any) => t.status !== "closed").length;

        // Calculate real resource limits from purchased plans of active services
        let totalCpu = 0;
        let totalRam = 0;
        let totalDisk = 0;
        const activeServices = (servicesData.services || []).filter((s: any) => s.status === "Active");
        
        activeServices.forEach((srv: any) => {
          const plan = plansData.find((p: any) => p.id === srv.planId);
          if (plan) {
            totalCpu += plan.cpu_pct || 0;
            totalRam += plan.ram_mb || 0;
            totalDisk += plan.disk_mb || 0;
          }
        });

        setStats({
          services: activeServices.length,
          tickets: openTickets,
          invoices: (servicesData.services || []).filter((s: any) => s.status === "Pending Payment").length,
          balance: "₹0.00"
        });

        setResources({
          cpu: totalCpu,
          ram: totalRam,
          disk: totalDisk
        });

        setActivity(activityData.logs || []);
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const quickActions = [
    { label: "Order Service", path: "/dashboard/deploy", icon: Gamepad2 },
    { label: "Open Support Ticket", path: "/dashboard/support/create", icon: HelpCircle },
    { label: "Pay Due Invoices", path: "/dashboard/invoices", icon: Receipt }
  ];

  const announcements = [
    { title: "Intel Core Ultra Nodes Active", desc: "New high-frequency game instances are now open for deployment in Central Europe.", date: "Today" },
    { title: "WAL DB Performance Tuning", desc: "Database query latency improved by 40% globally.", date: "Yesterday" }
  ];

  if (loading) return <SkeletonLoader />;

  // Max thresholds representing limits of contract tiers
  const maxCpu = 800; // 8 Cores (800%)
  const maxRam = 8192; // 8 GB
  const maxDisk = 102400; // 100 GB

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
        <StatCard label="Active Services" value={stats.services} icon={Gamepad2} />
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
                    className="w-full flex flex-col items-center justify-center p-5 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-white/[0.02] hover:border-zinc-700 text-center transition-all cursor-pointer group gap-3"
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
          <DashboardCard title="Aggregated Resource Usage" subtitle="Total purchased compute allocation details">
            <div className="space-y-4.5 pt-2">
              <ProgressBar value={resources.cpu} max={maxCpu} label="CPU Core Allocation" sublabel={`${(resources.cpu / 100).toFixed(1)} / 8.0 Cores`} />
              <ProgressBar value={resources.ram} max={maxRam} label="Memory Allocation" sublabel={`${(resources.ram / 1024).toFixed(1)} / 8.0 GB`} />
              <ProgressBar value={resources.disk} max={maxDisk} label="NVMe Storage Space" sublabel={`${(resources.disk / 1024).toFixed(1)} / 100.0 GB`} />
            </div>
          </DashboardCard>
        </div>

        {/* Right column: Activity & Announcements */}
        <div className="space-y-6">
          {/* Timeline Activity list */}
          <DashboardCard title="Recent Activity" subtitle="User account security log events">
            <div className="space-y-4 pt-2">
              {activity.length > 0 ? (
                activity.slice(0, 5).map((act, idx) => (
                  <div key={idx} className="flex gap-3 text-xs leading-normal">
                    <div className="p-1.5 h-fit rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-500 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white uppercase tracking-wider text-[9px]">
                          {act.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-[9px] font-semibold text-zinc-655">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-semibold">Security event logged successfully</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-zinc-655 text-xs font-semibold">No recent log history.</p>
              )}
            </div>
          </DashboardCard>

          {/* Announcements block */}
          <DashboardCard title="System Announcements" subtitle="Latest status alerts & system changes" headerAction={<Megaphone className="w-4 h-4 text-zinc-500" />}>
            <div className="space-y-4 pt-2">
              {announcements.map((ann, idx) => (
                <div key={idx} className="space-y-1.5 border-b border-zinc-800/40 last:border-0 pb-3 last:pb-0">
                  <div className="flex justify-between items-center">
                    <h5 className="text-xs font-bold text-white">{ann.title}</h5>
                    <span className="text-[9px] bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-zinc-550 font-bold uppercase tracking-wider">{ann.date}</span>
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
