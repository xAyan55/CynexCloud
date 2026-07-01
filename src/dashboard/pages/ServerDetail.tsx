import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import StatusPill from "../components/StatusPill";
import ProgressBar from "../components/ProgressBar";
import DashboardCard from "../components/DashboardCard";
import SkeletonLoader from "../components/SkeletonLoader";
import DataTable, { Column } from "../components/DataTable";
import EmptyState from "../components/EmptyState";
import { Button } from "@/components/ui/button";
import { 
  Terminal, 
  Archive, 
  Database, 
  Network as NetIcon, 
  Play, 
  Cpu, 
  Square, 
  RefreshCw,
  FolderOpen,
  Calendar,
  Users,
  Settings as GearIcon,
  Loader2,
  Trash
} from "lucide-react";

interface Backup {
  id: string;
  name: string;
  size: string;
  createdAt: string;
}

interface ServerDb {
  id: string;
  name: string;
  username: string;
  host: string;
}

export default function ServerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [server, setServer] = useState<any>(null);
  
  // Power states
  const [powerLoading, setPowerLoading] = useState<string | null>(null);

  // Console states
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "Connecting to Wings Node EU-GER-01...",
    "Authentication verified with API JWT client token.",
    "Fetching current instance status...",
    "Server matches Spigot 1.20.4 production profile."
  ]);
  const [commandInput, setCommandInput] = useState("");
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Backups / DB states
  const [backups, setBackups] = useState<Backup[]>([
    { id: "1", name: "automated-backup-daily", size: "245 MB", createdAt: "Today at 04:00 AM" }
  ]);
  const [databases, setDatabases] = useState<ServerDb[]>([
    { id: "1", name: "s1_main", username: "u1_f293b", host: "127.0.0.1" }
  ]);

  // Load server details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await authFetch("/api/panel/servers");
        if (res.ok) {
          const data = await res.json();
          const found = data.servers?.find((s: any) => s.attributes.identifier === id);
          if (found) {
            setServer(found.attributes);
          } else {
            navigate("/dashboard/servers");
          }
        }
      } catch (err) {
        console.error("Failed to load server details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  // Scroll console to bottom on update
  useEffect(() => {
    if (activeTab === "console") {
      consoleBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLogs, activeTab]);

  const handlePowerAction = async (action: "start" | "stop" | "restart") => {
    if (!server) return;
    setPowerLoading(action);
    setConsoleLogs(prev => [...prev, `Sending power signal: ${action.toUpperCase()}...`]);

    try {
      const res = await authFetch(`/api/panel/servers/${server.identifier}/power`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signal: action })
      });
      if (res.ok) {
        setConsoleLogs(prev => [...prev, `Power action ${action.toUpperCase()} successfully dispatched.`]);
      }
    } catch (err) {
      setConsoleLogs(prev => [...prev, `Error: Failed to perform ${action} action.`]);
    } finally {
      setPowerLoading(null);
    }
  };

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    setConsoleLogs(prev => [...prev, `> ${commandInput}`]);
    const cmd = commandInput.toLowerCase();
    
    // Simulate terminal response
    setTimeout(() => {
      if (cmd === "help") {
        setConsoleLogs(prev => [...prev, "Available commands: help, status, list, version"]);
      } else if (cmd === "status") {
        setConsoleLogs(prev => [...prev, "Status: Online | CPU: 12.4% | Memory: 2.1 GB / 4.0 GB"]);
      } else if (cmd === "list") {
        setConsoleLogs(prev => [...prev, "There are 0/20 players online."]);
      } else {
        setConsoleLogs(prev => [...prev, `Unknown command: ${commandInput}. Type 'help' for support.`]);
      }
    }, 100);

    setCommandInput("");
  };

  const backupColumns: Column<Backup>[] = [
    { key: "name", label: "Backup Name" },
    { key: "size", label: "File Size" },
    { key: "createdAt", label: "Created At" }
  ];

  const dbColumns: Column<ServerDb>[] = [
    { key: "name", label: "Database Name" },
    { key: "username", label: "Username" },
    { key: "host", label: "Host IP" }
  ];

  if (loading) return <SkeletonLoader />;
  if (!server) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: Cpu },
    { id: "console", label: "Console", icon: Terminal },
    { id: "files", label: "Files", icon: FolderOpen },
    { id: "backups", label: "Backups", icon: Archive },
    { id: "databases", label: "Databases", icon: Database },
    { id: "network", label: "Network", icon: NetIcon },
    { id: "schedules", label: "Schedules", icon: Calendar },
    { id: "subusers", label: "Subusers", icon: Users },
    { id: "settings", label: "Settings", icon: GearIcon }
  ];

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      {/* Title Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-850 pb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">{server.name}</h2>
          <p className="text-xs text-zinc-500 font-medium">Identifier: {server.identifier} | Node: {server.node || "GER-01"}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            onClick={() => handlePowerAction("start")} 
            disabled={!!powerLoading}
            className="p-2 h-auto bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 text-emerald-400" />
          </Button>
          <Button 
            onClick={() => handlePowerAction("restart")} 
            disabled={!!powerLoading}
            className="p-2 h-auto bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-yellow-400" />
          </Button>
          <Button 
            onClick={() => handlePowerAction("stop")} 
            disabled={!!powerLoading}
            className="p-2 h-auto bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <Square className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-850 overflow-x-auto gap-2 scrollbar-none">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-all shrink-0 ${
                activeTab === tab.id 
                  ? "border-white text-white" 
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DashboardCard title="Realtime Resource Usage" subtitle="Compute load specifications">
              <div className="space-y-4 pt-2">
                <ProgressBar value={12.4} label="CPU Load" sublabel="12.4% / 100%" />
                <ProgressBar value={52} label="Memory Usage" sublabel="2.1 GB / 4.0 GB" />
                <ProgressBar value={20} label="Storage utilization" sublabel="10 GB / 50 GB" />
              </div>
            </DashboardCard>
          </div>

          <div className="space-y-6">
            <DashboardCard title="Connection Information" subtitle="Address parameters">
              <div className="space-y-3.5 pt-2 text-xs text-zinc-400 font-medium">
                <div>
                  <span className="text-[10px] font-bold text-zinc-650 uppercase tracking-widest block mb-0.5">Primary Connection IP</span>
                  <span className="font-mono text-white text-[11px] select-all">{server.node || "127.0.0.1"}:25565</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-650 uppercase tracking-widest block mb-0.5">SFTP Host Address</span>
                  <span className="font-mono text-white text-[11px] select-all">sftp.cynexcloud.com:2022</span>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      )}

      {activeTab === "console" && (
        <div className="space-y-4">
          <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 h-96 overflow-y-auto font-mono text-[11px] text-zinc-400 space-y-1.5 scrollbar-none flex flex-col justify-start">
            {consoleLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed break-all whitespace-pre-wrap">
                {log}
              </div>
            ))}
            <div ref={consoleBottomRef} />
          </div>

          <form onSubmit={handleSendCommand} className="flex gap-3">
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg px-4 py-2.5 text-xs font-mono focus:outline-none"
              placeholder="Type command here (e.g. status, list, help)..."
            />
            <Button
              type="submit"
              className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-2 px-5 h-auto text-xs rounded-lg border-none cursor-pointer"
            >
              Send
            </Button>
          </form>
        </div>
      )}

      {activeTab === "files" && (
        <EmptyState
          title="File manager coming soon"
          description="A complete directory web browser and file manager integration is currently under development."
          icon={FolderOpen}
          actionLabel="View SFTP Guide"
          onAction={() => setActiveTab("overview")}
        />
      )}

      {activeTab === "backups" && (
        <DashboardCard title="Volume Backups" subtitle="Manage full system state backups">
          <div className="pt-2">
            <DataTable columns={backupColumns} data={backups} pageSize={5} />
          </div>
        </DashboardCard>
      )}

      {activeTab === "databases" && (
        <DashboardCard title="Host Databases" subtitle="Linked database schemas">
          <div className="pt-2">
            <DataTable columns={dbColumns} data={databases} pageSize={5} />
          </div>
        </DashboardCard>
      )}

      {activeTab === "network" && (
        <DashboardCard title="Allocated Ports" subtitle="IP and port allocations">
          <div className="pt-2 text-xs font-semibold text-zinc-400 space-y-3">
            <div className="flex justify-between items-center bg-zinc-950 border border-zinc-800 p-4.5 rounded-xl">
              <div>
                <span className="font-mono text-white text-[11px]">{server.node || "127.0.0.1"}:25565</span>
                <span className="text-[10px] text-zinc-500 font-bold block mt-0.5">PRIMARY ALLOCATION</span>
              </div>
              <span className="text-[9px] font-bold text-zinc-500 bg-white/[0.04] border border-zinc-800 px-2 py-0.5 rounded uppercase tracking-wider">Active</span>
            </div>
          </div>
        </DashboardCard>
      )}

      {activeTab === "schedules" && (
        <EmptyState
          title="No schedules configured"
          description="Schedules allow you to run automated server commands, backup triggers, or restarts at set time intervals."
          icon={Calendar}
          actionLabel="Create Schedule"
          onAction={() => {}}
        />
      )}

      {activeTab === "subusers" && (
        <EmptyState
          title="No subusers added"
          description="Grant other registered CynexCloud accounts custom permissions to manage or view this instance."
          icon={Users}
          actionLabel="Add Subuser"
          onAction={() => {}}
        />
      )}

      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DashboardCard title="Reinstall Instance" subtitle="Danger zone" className="border-red-950/20">
              <div className="space-y-4 pt-2">
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">Reinstalling your server will delete all system binaries, libraries, and configurations, pulling a fresh package from the node repositories.</p>
                <Button className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs py-2 px-4 h-auto rounded-lg transition-colors cursor-pointer flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reinstall Server</span>
                </Button>
              </div>
            </DashboardCard>

            <DashboardCard title="Delete Instance" subtitle="Danger zone" className="border-red-950/20">
              <div className="space-y-4 pt-2">
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">Deleting your server is a destructive action. All data, backups, and databases linked to this identifier will be permanently deleted.</p>
                <Button className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs py-2 px-4 h-auto rounded-lg transition-colors cursor-pointer flex items-center gap-1.5">
                  <Trash className="w-3.5 h-3.5" />
                  <span>Delete Server</span>
                </Button>
              </div>
            </DashboardCard>
          </div>
        </div>
      )}
    </div>
  );
}
