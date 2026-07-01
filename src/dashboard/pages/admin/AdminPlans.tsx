import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import DashboardCard from "../../components/DashboardCard";
import DataTable, { Column } from "../../components/DataTable";
import SkeletonLoader from "../../components/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Copy, Trash2, Edit2, Loader2, ArrowUp, ArrowDown } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  category: "minecraft" | "vps" | "discord";
  price: string;
  price_numeric: number;
  description: string;
  ram: string;
  cpu: string;
  storage: string;
  features: string[];
  status: "active" | "inactive";
  visibility: "public" | "hidden";
  order?: number;
  
  // Technical mappings
  nestId?: string;
  eggId?: string;
  locationId?: string;
  ram_mb?: number;
  cpu_pct?: number;
  disk_mb?: number;
  databases?: number;
  backups?: number;
  allocations?: number;
  dockerImage?: string;
  startup?: string;
  environment?: string;
}

export default function AdminPlans() {
  const { authFetch } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<"minecraft" | "vps" | "discord">("minecraft");

  // Modal / Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorPlan, setEditorPlan] = useState<Partial<Plan> | null>(null);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);

  // Dynamic dropdown assets from Pterodactyl
  const [locations, setLocations] = useState<any[]>([]);
  const [nests, setNests] = useState<any[]>([]);
  const [eggs, setEggs] = useState<any[]>([]);
  const [fetchingEggs, setFetchingEggs] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await authFetch("/api/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data || []);
      }
    } catch (err) {
      console.error("Failed to load plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPterodactylAssets = async () => {
    try {
      const locRes = await authFetch("/api/admin/pterodactyl/locations");
      const nestRes = await authFetch("/api/admin/pterodactyl/nests");
      if (locRes.ok && nestRes.ok) {
        const locData = await locRes.json();
        const nestData = await nestRes.json();
        setLocations(locData.locations || []);
        setNests(nestData.nests || []);
      }
    } catch (err) {
      console.error("Failed to load Pterodactyl dropdown configs:", err);
    }
  };

  const fetchEggsForNest = async (nestId: string) => {
    if (!nestId) return;
    setFetchingEggs(true);
    try {
      const res = await authFetch(`/api/admin/pterodactyl/nests/${nestId}/eggs`);
      if (res.ok) {
        const data = await res.json();
        setEggs(data.eggs || []);
      }
    } catch (err) {
      console.error("Failed to load eggs:", err);
    } finally {
      setFetchingEggs(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchPterodactylAssets();
  }, []);

  const handleCreateNew = () => {
    setEditorPlan({
      id: "plan-" + Math.floor(Math.random() * 1000),
      name: "",
      category: "minecraft",
      price: "100",
      price_numeric: 100,
      description: "",
      ram: "4 GB",
      cpu: "100% CPU",
      storage: "10 GB NVMe",
      features: ["Daily Backups"],
      status: "active",
      visibility: "public",
      order: plans.length + 1,
      nestId: "1",
      eggId: "1",
      locationId: "1",
      ram_mb: 4096,
      cpu_pct: 100,
      disk_mb: 10240,
      databases: 1,
      backups: 1,
      allocations: 1,
      dockerImage: "ghcr.io/pterodactyl/yolks:java_17",
      startup: "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}",
      environment: "{}"
    });
    setEggs([]);
    setIsEditorOpen(true);
  };

  const handleEdit = (plan: Plan) => {
    setEditorPlan(plan);
    if (plan.nestId) {
      fetchEggsForNest(plan.nestId);
    }
    setIsEditorOpen(true);
  };

  const handleDuplicate = (plan: Plan) => {
    const dup: Partial<Plan> = {
      ...plan,
      id: plan.id + "-copy",
      name: plan.name + " (Copy)",
      order: plans.length + 1
    };
    setEditorPlan(dup);
    if (dup.nestId) {
      fetchEggsForNest(dup.nestId);
    }
    setIsEditorOpen(true);
  };

  const handleDelete = async (planId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this plan?")) return;
    try {
      const res = await authFetch(`/api/admin/plans/${planId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchPlans();
      }
    } catch (err) {
      console.error("Delete plan error:", err);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorPlan) return;
    setEditorLoading(true);
    setEditorError(null);

    try {
      const res = await authFetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editorPlan)
      });
      if (res.ok) {
        setIsEditorOpen(false);
        fetchPlans();
      } else {
        const err = await res.json();
        setEditorError(err.error || "Failed to save plan configuration.");
      }
    } catch {
      setEditorError("Connection failure.");
    } finally {
      setEditorLoading(false);
    }
  };

  const handleMoveOrder = async (plan: Plan, direction: "up" | "down") => {
    const idx = plans.findIndex(p => p.id === plan.id);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === plans.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const sibling = plans[targetIdx];

    // Swap order fields
    const planOrder = plan.order || 0;
    const siblingOrder = sibling.order || 0;

    try {
      await authFetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...plan, order: siblingOrder })
      });
      await authFetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sibling, order: planOrder })
      });
      fetchPlans();
    } catch (err) {
      console.error("Order change failed:", err);
    }
  };

  const columns: Column<Plan>[] = [
    { key: "name", label: "Plan Name" },
    {
      key: "category",
      label: "Category",
      render: (row) => (
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{row.category}</span>
      )
    },
    {
      key: "price_numeric",
      label: "Monthly Cost",
      render: (row) => <span className="font-mono">₹{row.price_numeric}</span>
    },
    {
      key: "visibility",
      label: "Visibility",
      render: (row) => (
        <span className={`text-[9px] font-bold uppercase tracking-wider ${row.visibility === "public" ? "text-emerald-400" : "text-zinc-550"}`}>
          {row.visibility}
        </span>
      )
    },
    {
      key: "order",
      label: "Ordering",
      render: (row) => (
        <div className="flex gap-1.5">
          <button onClick={() => handleMoveOrder(row, "up")} className="p-1 rounded bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-white cursor-pointer"><ArrowUp className="w-3 h-3" /></button>
          <button onClick={() => handleMoveOrder(row, "down")} className="p-1 rounded bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-white cursor-pointer"><ArrowDown className="w-3 h-3" /></button>
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="p-1 text-zinc-500 hover:text-white cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleDuplicate(row)} className="p-1 text-zinc-500 hover:text-white cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleDelete(row.id)} className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )
    }
  ];

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-850 pb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Plan Configurations</h2>
          <p className="text-xs text-zinc-500 font-medium">Create and manage storefront products and map them to technical Pterodactyl parameters.</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1 cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>New Plan</span>
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-zinc-900 pb-2">
        <button
          onClick={() => setSelectedCategory("minecraft")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            selectedCategory === "minecraft"
              ? "bg-white text-zinc-950"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          Minecraft Server Plans
        </button>
        <button
          onClick={() => setSelectedCategory("vps")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            selectedCategory === "vps"
              ? "bg-white text-zinc-950"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          Linux VPS Plans
        </button>
        <button
          onClick={() => setSelectedCategory("discord")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            selectedCategory === "discord"
              ? "bg-white text-zinc-950"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          Discord Bot Plans
        </button>
      </div>

      <DashboardCard 
        title={`${selectedCategory.toUpperCase()} Hosting Plans`} 
        subtitle="Plan list filtered configuration source of truth"
      >
        <div className="pt-2">
          <DataTable 
            columns={columns} 
            data={plans.filter(p => p.category === selectedCategory)} 
            pageSize={10} 
          />
        </div>
      </DashboardCard>

      {/* Editor Modal Popup */}
      {isEditorOpen && editorPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-8 max-w-2xl w-full relative my-8 max-h-[85vh] overflow-y-auto scrollbar-none">
            <div className="flex justify-between items-start border-b border-zinc-850 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-black uppercase text-white tracking-tight">Configure Service Plan</h3>
                <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Specify client display features & technical resources</p>
              </div>
              <button onClick={() => setIsEditorOpen(false)} className="text-zinc-500 hover:text-white font-bold text-sm">CLOSE</button>
            </div>

            {editorError && (
              <div className="p-3 mb-4 rounded-lg bg-red-950/20 border border-red-500/10 text-red-400 text-xs font-semibold">
                {editorError}
              </div>
            )}

            <form onSubmit={handleSavePlan} className="space-y-6 text-xs">
              {/* Category selector */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Plan ID (Unique Identifier)</label>
                  <input
                    type="text"
                    required
                    value={editorPlan.id}
                    onChange={(e) => setEditorPlan({ ...editorPlan, id: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editorPlan.name}
                    onChange={(e) => setEditorPlan({ ...editorPlan, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Product Group</label>
                  <select
                    value={editorPlan.category}
                    onChange={(e: any) => setEditorPlan({ ...editorPlan, category: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2 focus:outline-none"
                  >
                    <option value="minecraft">Minecraft Hosting</option>
                    <option value="vps">Virtual Server (VPS)</option>
                    <option value="discord">Discord Bot Hosting</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Price Numeric (INR)</label>
                  <input
                    type="number"
                    required
                    value={editorPlan.price_numeric}
                    onChange={(e) => setEditorPlan({ ...editorPlan, price_numeric: parseFloat(e.target.value), price: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Visibility</label>
                  <select
                    value={editorPlan.visibility}
                    onChange={(e: any) => setEditorPlan({ ...editorPlan, visibility: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2 focus:outline-none"
                  >
                    <option value="public">Visible Storefront</option>
                    <option value="hidden">Hidden Config</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Product Description</label>
                <textarea
                  rows={2}
                  value={editorPlan.description}
                  onChange={(e) => setEditorPlan({ ...editorPlan, description: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2 resize-none"
                />
              </div>

              {/* Client specs display fields */}
              <div className="border-t border-zinc-900 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Storefront Specifications Label</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">RAM Display Label</label>
                    <input
                      type="text"
                      value={editorPlan.ram}
                      onChange={(e) => setEditorPlan({ ...editorPlan, ram: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2"
                      placeholder="e.g. 4GB Ram"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">CPU Display Label</label>
                    <input
                      type="text"
                      value={editorPlan.cpu}
                      onChange={(e) => setEditorPlan({ ...editorPlan, cpu: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2"
                      placeholder="e.g. 100% Cpu"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Disk Display Label</label>
                    <input
                      type="text"
                      value={editorPlan.storage}
                      onChange={(e) => setEditorPlan({ ...editorPlan, storage: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2"
                      placeholder="e.g. 20GB NVMe"
                    />
                  </div>
                </div>
              </div>

              {/* Pterodactyl API Settings Mapping */}
              <div className="border-t border-zinc-900 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Technical Pterodactyl Provisioning Specs</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Node Location</label>
                    <select
                      value={editorPlan.locationId}
                      onChange={(e) => setEditorPlan({ ...editorPlan, locationId: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2 focus:outline-none"
                    >
                      {locations.map((loc) => (
                        <option key={loc.attributes.id} value={loc.attributes.id}>
                          {loc.attributes.long || loc.attributes.short} (ID: {loc.attributes.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Panel Nest</label>
                    <select
                      value={editorPlan.nestId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditorPlan({ ...editorPlan, nestId: val });
                        fetchEggsForNest(val);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2 focus:outline-none"
                    >
                      {nests.map((n) => (
                        <option key={n.attributes.id} value={n.attributes.id}>
                          {n.attributes.name} (ID: {n.attributes.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Egg mapping</label>
                    <select
                      value={editorPlan.eggId}
                      disabled={fetchingEggs}
                      onChange={(e) => setEditorPlan({ ...editorPlan, eggId: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2 focus:outline-none"
                    >
                      {eggs.map((egg) => (
                        <option key={egg.attributes.id} value={egg.attributes.id}>
                          {egg.attributes.name} (ID: {egg.attributes.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Allocated Memory (MB)</label>
                    <input
                      type="number"
                      value={editorPlan.ram_mb}
                      onChange={(e) => setEditorPlan({ ...editorPlan, ram_mb: parseInt(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">CPU Threads Limit (%)</label>
                    <input
                      type="number"
                      value={editorPlan.cpu_pct}
                      onChange={(e) => setEditorPlan({ ...editorPlan, cpu_pct: parseInt(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">NVMe Disk Limit (MB)</label>
                    <input
                      type="number"
                      value={editorPlan.disk_mb}
                      onChange={(e) => setEditorPlan({ ...editorPlan, disk_mb: parseInt(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Max Databases</label>
                    <input
                      type="number"
                      value={editorPlan.databases}
                      onChange={(e) => setEditorPlan({ ...editorPlan, databases: parseInt(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Max Backups</label>
                    <input
                      type="number"
                      value={editorPlan.backups}
                      onChange={(e) => setEditorPlan({ ...editorPlan, backups: parseInt(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Max Allocations</label>
                    <input
                      type="number"
                      value={editorPlan.allocations}
                      onChange={(e) => setEditorPlan({ ...editorPlan, allocations: parseInt(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Docker Image String</label>
                  <input
                    type="text"
                    value={editorPlan.dockerImage}
                    onChange={(e) => setEditorPlan({ ...editorPlan, dockerImage: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Startup Command Template</label>
                  <input
                    type="text"
                    value={editorPlan.startup}
                    onChange={(e) => setEditorPlan({ ...editorPlan, startup: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Environment Variables (JSON Format)</label>
                  <input
                    type="text"
                    value={editorPlan.environment}
                    onChange={(e) => setEditorPlan({ ...editorPlan, environment: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2 font-mono"
                    placeholder='{"SERVER_JARFILE": "server.jar"}'
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-900 pt-5 mt-6">
                <Button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-bold py-2 px-5 h-auto rounded-lg cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editorLoading}
                  className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-2 px-6 h-auto rounded-lg border-none cursor-pointer flex items-center gap-1.5"
                >
                  {editorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Configuration"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
