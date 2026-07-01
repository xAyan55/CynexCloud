import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import DashboardCard from "../../components/DashboardCard";
import DataTable, { Column } from "../../components/DataTable";
import SkeletonLoader from "../../components/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Settings, Users, Server, Shield, Loader2, AlertCircle } from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  banned: number;
  createdAt: string;
}

export default function PanelConfig() {
  const { authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState<"panel" | "users">("panel");
  const [loading, setLoading] = useState(true);
  
  // Configuration states
  const [panelUrl, setPanelUrl] = useState("");
  const [appKey, setAppKey] = useState("");
  const [clientKey, setClientKey] = useState("");
  const [configSaving, setConfigSaving] = useState(false);
  const [configMessage, setConfigMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // User list states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userActionId, setUserActionId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Panel Settings
      const settingsRes = await authFetch("/api/admin/settings");
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setPanelUrl(data.settings?.pterodactyl_url || "");
        setAppKey(data.settings?.pterodactyl_app_key || "");
        setClientKey(data.settings?.pterodactyl_client_key || "");
      }

      // 2. Fetch Users List
      const usersRes = await authFetch("/api/admin/users");
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaving(true);
    setConfigMessage(null);

    try {
      const res = await authFetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pterodactyl_url: panelUrl,
          pterodactyl_app_key: appKey,
          pterodactyl_client_key: clientKey
        })
      });

      if (res.ok) {
        setConfigMessage({ type: "success", text: "Pterodactyl settings saved successfully." });
      } else {
        const err = await res.json();
        setConfigMessage({ type: "error", text: err.error || "Failed to save settings." });
      }
    } catch {
      setConfigMessage({ type: "error", text: "Connection error occurred." });
    } finally {
      setConfigSaving(false);
    }
  };

  const handleToggleBan = async (user: AdminUser) => {
    setUserActionId(user.id);
    try {
      const res = await authFetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: !user.banned })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error("Failed to update user status:", err);
    } finally {
      setUserActionId(null);
    }
  };

  const handleToggleRole = async (user: AdminUser) => {
    setUserActionId(user.id);
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      const res = await authFetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error("Failed to update user role:", err);
    } finally {
      setUserActionId(null);
    }
  };

  const userColumns: Column<AdminUser>[] = [
    { key: "username", label: "Username" },
    { key: "email", label: "Email Address" },
    {
      key: "role",
      label: "Account Role",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          row.role === "admin" ? "bg-white text-zinc-950" : "bg-zinc-950 border border-zinc-800 text-zinc-400"
        }`}>
          {row.role}
        </span>
      )
    },
    {
      key: "banned",
      label: "Ban Status",
      render: (row) => (
        <span className={`text-[10px] font-bold uppercase tracking-wider ${row.banned ? "text-red-400" : "text-zinc-500"}`}>
          {row.banned ? "Banned" : "Active"}
        </span>
      )
    },
    {
      key: "actions",
      label: "Administrative Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button
            onClick={() => handleToggleRole(row)}
            disabled={!!userActionId}
            className="bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 text-[10px] py-1 px-2.5 h-auto rounded transition-colors text-zinc-400 hover:text-white cursor-pointer"
          >
            Change Role
          </Button>
          <Button
            onClick={() => handleToggleBan(row)}
            disabled={!!userActionId}
            className={`font-bold text-[10px] py-1 px-2.5 h-auto rounded transition-colors cursor-pointer border ${
              row.banned 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white" 
                : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
            }`}
          >
            {row.banned ? "Unban" : "Ban"}
          </Button>
        </div>
      )
    }
  ];

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Admin Console</h2>
        <p className="text-xs text-zinc-500 font-medium">Configure internal settings, sync Pterodactyl APIs, and manage registered profiles.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-850 gap-2">
        <button
          onClick={() => setActiveTab("panel")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
            activeTab === "panel" 
              ? "border-white text-white" 
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Pterodactyl Configuration</span>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
            activeTab === "users" 
              ? "border-white text-white" 
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Profiles</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "panel" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DashboardCard title="Pterodactyl Node Integration" subtitle="API mapping keys">
              <form onSubmit={handleSaveConfig} className="space-y-4.5 pt-2">
                {configMessage && (
                  <div className={`p-3.5 rounded-lg border text-xs font-semibold ${
                    configMessage.type === "success" 
                      ? "bg-emerald-950/20 border-emerald-500/10 text-emerald-400" 
                      : "bg-red-950/20 border-red-500/10 text-red-400"
                  }`}>
                    {configMessage.text}
                  </div>
                )}

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
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Application API Key (Read/Write)</label>
                  <input
                    type="password"
                    required
                    value={appKey}
                    onChange={(e) => setAppKey(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg px-3.5 py-2.5 text-xs font-semibold focus:outline-none"
                    placeholder="ptla_••••••••••••••••••••••••••••••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Client API Key (Read/Write)</label>
                  <input
                    type="password"
                    required
                    value={clientKey}
                    onChange={(e) => setClientKey(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg px-3.5 py-2.5 text-xs font-semibold focus:outline-none"
                    placeholder="ptlc_••••••••••••••••••••••••••••••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={configSaving}
                  className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-2.5 px-5 h-auto text-xs rounded-lg border-none cursor-pointer flex items-center gap-1.5"
                >
                  {configSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Settings"}
                </Button>
              </form>
            </DashboardCard>
          </div>

          <div className="space-y-6">
            <DashboardCard title="Integration Guide" subtitle="Helpful advice">
              <div className="space-y-3 pt-2 text-xs text-zinc-400 leading-relaxed font-medium">
                <p>1. Generate an **Application API Key** from your Pterodactyl Admin settings panel with full read/write permissions for Users and Servers.</p>
                <p>2. Create a **Client API Key** from your personal account settings on Pterodactyl. This key is used to proxy server resource stats and execute power controls (start, stop, etc.).</p>
                <p>3. CynexCloud automatically maps login email profiles to Pterodactyl user profiles to query server listings seamlessly.</p>
              </div>
            </DashboardCard>
          </div>
        </div>
      ) : (
        <DashboardCard title="Registered User Profiles" subtitle="Manage permissions, roles, and ban lists">
          <div className="pt-2">
            <DataTable columns={userColumns} data={users} pageSize={8} />
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
