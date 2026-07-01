import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import DashboardCard from "../components/DashboardCard";
import DataTable, { Column } from "../components/DataTable";
import SkeletonLoader from "../components/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Shield, Key, Smartphone, Monitor, AlertOctagon, Loader2 } from "lucide-react";

interface Session {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  lastActive: string;
  revoked: number;
}

export default function Security() {
  const { authFetch } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminatingId, setTerminatingId] = useState<string | null>(null);
  const [terminatingOthers, setTerminatingOthers] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await authFetch("/api/auth/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Failed to load active sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleTerminateSession = async (sessionId: string) => {
    setTerminatingId(sessionId);
    setMessage(null);
    try {
      const res = await authFetch("/api/auth/sessions/terminate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Session terminated successfully." });
        fetchSessions();
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to terminate session." });
      }
    } catch {
      setMessage({ type: "error", text: "Connection error occurred." });
    } finally {
      setTerminatingId(null);
    }
  };

  const handleTerminateOthers = async () => {
    setTerminatingOthers(true);
    setMessage(null);
    try {
      const res = await authFetch("/api/auth/sessions/terminate-others", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setMessage({ type: "success", text: "All other sessions terminated." });
        fetchSessions();
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to terminate other sessions." });
      }
    } catch {
      setMessage({ type: "error", text: "Connection error occurred." });
    } finally {
      setTerminatingOthers(false);
    }
  };

  const sessionColumns: Column<Session>[] = [
    {
      key: "device",
      label: "Device / Browser",
      render: (row) => {
        const isMobile = row.device?.toLowerCase().includes("mobile") || row.device?.toLowerCase().includes("phone");
        return (
          <div className="flex items-center gap-3">
            {isMobile ? <Smartphone className="w-4 h-4 text-zinc-500" /> : <Monitor className="w-4 h-4 text-zinc-500" />}
            <div>
              <span className="font-bold text-white block">{row.device || "Unknown Device"}</span>
              <span className="text-[10px] text-zinc-500 font-semibold">{row.browser || "Unknown Browser"}</span>
            </div>
          </div>
        );
      }
    },
    { key: "ipAddress", label: "IP Address" },
    { key: "lastActive", label: "Last Active" },
    {
      key: "actions",
      label: "Revocation",
      render: (row) => (
        <Button
          onClick={() => handleTerminateSession(row.id)}
          disabled={!!terminatingId}
          className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold text-[10px] py-1 px-3 h-auto rounded transition-colors cursor-pointer"
        >
          {terminatingId === row.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Terminate"}
        </Button>
      )
    }
  ];

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Security & Sessions</h2>
        <p className="text-xs text-zinc-500 font-medium">Monitor active web client logins and revoke remote sessions.</p>
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

      {/* Grid wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Terminate options */}
        <div className="space-y-6">
          <DashboardCard title="Remote Access Controls" subtitle="Revoke access tokens">
            <div className="space-y-4 pt-2">
              <div className="flex gap-3 text-xs leading-normal bg-red-950/5 border border-red-500/5 p-4 rounded-xl text-zinc-500">
                <AlertOctagon className="w-5 h-5 text-red-400/80 shrink-0" />
                <div className="space-y-1">
                  <span className="font-bold text-zinc-400">Emergency Outage?</span>
                  <p className="text-[11px] leading-relaxed">If you suspect your credentials have been compromised, immediately revoke all other active sessions.</p>
                </div>
              </div>
              <Button
                onClick={handleTerminateOthers}
                disabled={terminatingOthers}
                className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-2.5 h-auto text-xs rounded-lg transition-colors border-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {terminatingOthers ? <Loader2 className="w-4 h-4 animate-spin" /> : "Revoke All Other Sessions"}
              </Button>
            </div>
          </DashboardCard>
        </div>

        {/* Right column: active sessions table */}
        <div className="lg:col-span-2">
          <DashboardCard title="Active Device Sessions" subtitle="Logins authorized on your account">
            <div className="pt-2">
              <DataTable columns={sessionColumns} data={sessions} pageSize={5} />
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
