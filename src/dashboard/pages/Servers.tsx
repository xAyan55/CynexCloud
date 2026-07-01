import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import StatusPill from "../components/StatusPill";
import ProgressBar from "../components/ProgressBar";
import SkeletonLoader from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import { Server, Gamepad2, Plus, Terminal, Power, RefreshCw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PanelServer {
  attributes: {
    identifier: string;
    uuid: string;
    name: string;
    node: string;
    description: string;
    limits: {
      memory: number;
      swap: number;
      disk: number;
      io: number;
      cpu: number;
    };
    feature_limits: {
      databases: number;
      allocations: number;
      backups: number;
    };
    status?: string;
  };
}

export default function Servers() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [servers, setServers] = useState<PanelServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [powerLoadingId, setPowerLoadingId] = useState<string | null>(null);

  const fetchServers = async () => {
    try {
      const res = await authFetch("/api/panel/servers");
      if (res.ok) {
        const data = await res.json();
        setServers(data.servers || []);
      }
    } catch (err) {
      console.error("Failed to fetch servers list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handlePowerAction = async (e: React.MouseEvent, serverId: string, action: "start" | "stop" | "restart") => {
    e.stopPropagation(); // Avoid triggering navigation
    setPowerLoadingId(`${serverId}-${action}`);

    try {
      const res = await authFetch(`/api/panel/servers/${serverId}/power`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signal: action })
      });
      if (res.ok) {
        // Reload list to update status
        fetchServers();
      }
    } catch (err) {
      console.error("Power action failed:", err);
    } finally {
      setPowerLoadingId(null);
    }
  };

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Active Services</h2>
          <p className="text-xs text-zinc-500 font-medium">Monitor your cloud hosting server allocations and configurations.</p>
        </div>
        <Button
          onClick={() => navigate("/dashboard/deploy")}
          className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-2 px-4 h-auto text-xs rounded-lg transition-colors border-none flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy Server</span>
        </Button>
      </div>

      {servers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {servers.map((srv) => {
            const attr = srv.attributes;
            const memoryUsageMB = attr.limits.memory;
            const ramLabel = memoryUsageMB > 0 ? `${memoryUsageMB / 1024} GB` : "Unlimited";
            const diskLabel = attr.limits.disk > 0 ? `${attr.limits.disk / 1024} GB` : "Unlimited";
            const cpuLabel = attr.limits.cpu > 0 ? `${attr.limits.cpu}%` : "Unlimited";

            return (
              <div
                key={attr.identifier}
                onClick={() => navigate(`/dashboard/servers/${attr.identifier}`)}
                className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 hover:bg-white/[0.01] transition-all flex flex-col justify-between cursor-pointer group gap-5"
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white leading-none group-hover:text-white transition-colors">
                        {attr.name}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono tracking-wide">
                        IP: {attr.node || "192.168.1.100"}:{25565}
                      </p>
                    </div>
                    <StatusPill status={attr.status || "online"} />
                  </div>

                  {/* Resource Gauges */}
                  <div className="space-y-2.5 pt-1">
                    <ProgressBar value={attr.status === "suspended" ? 0 : 25} label="CPU Load" sublabel={cpuLabel} />
                    <ProgressBar value={attr.status === "suspended" ? 0 : 45} label="RAM Usage" sublabel={ramLabel} />
                    <ProgressBar value={10} label="Storage allocation" sublabel={diskLabel} />
                  </div>
                </div>

                {/* Footer Controls & Quick Console Action */}
                <div className="flex items-center justify-between border-t border-zinc-850 pt-3 text-[10px] font-bold text-zinc-500">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handlePowerAction(e, attr.identifier, "start")}
                      disabled={!!powerLoadingId}
                      className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handlePowerAction(e, attr.identifier, "restart")}
                      disabled={!!powerLoadingId}
                      className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handlePowerAction(e, attr.identifier, "stop")}
                      disabled={!!powerLoadingId}
                      className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                    >
                      <Square className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 group-hover:text-zinc-300 transition-colors">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>OPEN CONSOLE</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No active servers found"
          description="You haven't deployed any high-frequency game servers or virtual machines yet."
          icon={Server}
          actionLabel="Create Server"
          onAction={() => navigate("/dashboard/deploy")}
        />
      )}
    </div>
  );
}
