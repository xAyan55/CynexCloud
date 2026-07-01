import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import DashboardCard from "../components/DashboardCard";
import DataTable, { Column } from "../components/DataTable";
import SkeletonLoader from "../components/SkeletonLoader";
import Modal from "../components/Modal";
import { Button } from "@/components/ui/button";
import { Key, Copy, Check, Trash, Plus, AlertTriangle, Loader2 } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
}

export default function ApiKeys() {
  const { authFetch } = useState(null) && useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyExpires, setKeyExpires] = useState("30");
  const [newKeyToken, setNewKeyToken] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchKeys = async () => {
    try {
      const res = await authFetch("/api/api-keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (err) {
      console.error("Failed to load API keys:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) return;
    setCreateLoading(true);

    try {
      const res = await authFetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: keyName,
          expiresDays: parseInt(keyExpires) || null
        })
      });

      if (res.ok) {
        const data = await res.json();
        setNewKeyToken(data.token);
        fetchKeys();
      }
    } catch (err) {
      console.error("Failed to create key:", err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      const res = await authFetch(`/api/api-keys/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchKeys();
      }
    } catch (err) {
      console.error("Failed to delete API key:", err);
    }
  };

  const handleCopyToken = () => {
    if (newKeyToken) {
      navigator.clipboard.writeText(newKeyToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const columns: Column<ApiKey>[] = [
    {
      key: "name",
      label: "Key Name",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Key className="w-3.5 h-3.5 text-zinc-500" />
          <span className="font-bold text-white">{row.name}</span>
        </div>
      )
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (row) => <span>{new Date(row.createdAt).toLocaleDateString()}</span>
    },
    {
      key: "expiresAt",
      label: "Expiration",
      render: (row) => <span>{row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : "Never"}</span>
    },
    {
      key: "lastUsed",
      label: "Last Used",
      render: (row) => <span>{row.lastUsed ? new Date(row.lastUsed).toLocaleDateString() : "Never Used"}</span>
    },
    {
      key: "actions",
      label: "Revoke",
      render: (row) => (
        <button
          onClick={() => handleDeleteKey(row.id)}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
        >
          <Trash className="w-4 h-4" />
        </button>
      )
    }
  ];

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">API Keys</h2>
          <p className="text-xs text-zinc-500 font-medium">Generate personal developer keys to authenticate script requests.</p>
        </div>
        <Button
          onClick={() => {
            setKeyName("");
            setNewKeyToken(null);
            setCreateOpen(true);
          }}
          className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-2 px-4 h-auto text-xs rounded-lg transition-colors border-none flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Key</span>
        </Button>
      </div>

      <DashboardCard title="Active Access Tokens" subtitle="Stored keys hashed with SHA-256 for maximum security">
        <div className="pt-2">
          <DataTable columns={columns} data={keys} pageSize={5} />
        </div>
      </DashboardCard>

      {/* Generate API Key Modal Dialog */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title={newKeyToken ? "API Token Generated" : "Generate API Key"}
        footerActions={
          newKeyToken ? (
            <Button
              onClick={() => setCreateOpen(false)}
              className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-2 px-5 h-auto text-xs rounded-lg border-none cursor-pointer"
            >
              Close
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => setCreateOpen(false)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-bold py-2 px-4 h-auto text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateKey}
                disabled={createLoading || !keyName}
                className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-2 px-4 h-auto text-xs rounded-lg border-none cursor-pointer flex items-center gap-1.5"
              >
                {createLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create Key"}
              </Button>
            </div>
          )
        }
      >
        {newKeyToken ? (
          <div className="space-y-4">
            <div className="flex gap-3 text-xs leading-normal bg-yellow-950/20 border border-yellow-500/10 p-4 rounded-xl text-yellow-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div className="space-y-1">
                <span className="font-bold">Copy this token now!</span>
                <p className="text-[11px] leading-relaxed text-yellow-400/80">For safety, this token is only shown once. You will not be able to retrieve it again once you close this dialog.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 p-3 rounded-lg font-mono text-[11px] text-white">
              <span className="flex-1 select-all break-all">{newKeyToken}</span>
              <button 
                onClick={handleCopyToken}
                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ) : (
          <form className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Key Name</label>
              <input
                type="text"
                required
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg px-3.5 py-2.5 text-xs font-semibold focus:outline-none"
                placeholder="e.g. CLI Dev Deployment Key"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Expiration Window</label>
              <select
                value={keyExpires}
                onChange={(e) => setKeyExpires(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg px-3.5 py-2.5 text-xs font-semibold focus:outline-none"
              >
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="0">Never Expire</option>
              </select>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
