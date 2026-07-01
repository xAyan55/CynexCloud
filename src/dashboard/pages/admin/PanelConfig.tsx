import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import DashboardCard from "../../components/DashboardCard";
import { Button } from "@/components/ui/button";
import SkeletonLoader from "../../components/SkeletonLoader";
import { Server, Settings, Loader2 } from "lucide-react";
import config from "../../../config.json";

export default function PanelConfig() {
  const { authFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Panel credentials
  const [panelUrl, setPanelUrl] = useState("");
  const [appKey, setAppKey] = useState("");
  const [clientKey, setClientKey] = useState("");
  
  // Plan mappings
  const [dirtNest, setDirtNest] = useState("1");
  const [dirtEgg, setDirtEgg] = useState("1");
  const [grassNest, setGrassNest] = useState("1");
  const [grassEgg, setGrassEgg] = useState("1");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await authFetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setPanelUrl(data.settings?.pterodactyl_url || "");
        setAppKey(data.settings?.pterodactyl_app_key || "");
        setClientKey(data.settings?.pterodactyl_client_key || "");

        // Load plan mappings if saved
        const dirtMap = JSON.parse(data.settings?.plan_mc_dirt || '{"nestId":"1","eggId":"1"}');
        setDirtNest(dirtMap.nestId);
        setDirtEgg(dirtMap.eggId);

        const grassMap = JSON.parse(data.settings?.plan_mc_grass || '{"nestId":"1","eggId":"1"}');
        setGrassNest(grassMap.nestId);
        setGrassEgg(grassMap.eggId);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await authFetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pterodactyl_url: panelUrl,
          pterodactyl_app_key: appKey,
          pterodactyl_client_key: clientKey,
          // Save plan mappings as setting keys
          plan_mc_dirt: JSON.stringify({ nestId: dirtNest, eggId: dirtEgg }),
          plan_mc_grass: JSON.stringify({ nestId: grassNest, eggId: grassEgg })
        })
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Settings and plan configurations saved." });
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to save settings." });
      }
    } catch {
      setMessage({ type: "error", text: "Connection error occurred." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Pterodactyl Configuration</h2>
        <p className="text-xs text-zinc-500 font-medium">Configure Pterodactyl node credentials and map server build plans.</p>
      </div>

      {message && (
        <div className={`p-3.5 rounded-lg border text-xs font-semibold ${
          message.type === "success" 
            ? "bg-emerald-950/20 border-emerald-500/10 text-emerald-400" 
            : "bg-red-950/20 border-red-500/10 text-red-400"
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="Pterodactyl Credentials" subtitle="Wings node secrets">
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Panel URL</label>
                <input
                  type="url"
                  required
                  value={panelUrl}
                  onChange={(e) => setPanelUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg px-3.5 py-2.5 text-xs font-semibold focus:outline-none"
                  placeholder="https://panel.cynexcloud.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Application API Key</label>
                <input
                  type="password"
                  required
                  value={appKey}
                  onChange={(e) => setAppKey(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg px-3.5 py-2.5 text-xs font-semibold focus:outline-none"
                  placeholder="ptla_••••••••"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Client API Key</label>
                <input
                  type="password"
                  required
                  value={clientKey}
                  onChange={(e) => setClientKey(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg px-3.5 py-2.5 text-xs font-semibold focus:outline-none"
                  placeholder="ptlc_••••••••"
                />
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Minecraft Plan Configurations" subtitle="Map shop items to panel nests and eggs">
            <div className="space-y-5 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-white mb-2">Dirt Plan (Lobby/Survival)</h5>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Nest ID</label>
                    <input
                      type="number"
                      required
                      value={dirtNest}
                      onChange={(e) => setDirtNest(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3.5 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Egg ID</label>
                    <input
                      type="number"
                      required
                      value={dirtEgg}
                      onChange={(e) => setDirtEgg(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3.5 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-white mb-2">Grass Plan (Bungee/Modded)</h5>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Nest ID</label>
                    <input
                      type="number"
                      required
                      value={grassNest}
                      onChange={(e) => setGrassNest(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3.5 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Egg ID</label>
                    <input
                      type="number"
                      required
                      value={grassEgg}
                      onChange={(e) => setGrassEgg(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3.5 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-2.5 px-6 h-auto text-xs rounded-lg border-none cursor-pointer flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Configurations"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
