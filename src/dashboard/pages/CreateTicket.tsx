import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import DashboardCard from "../components/DashboardCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function CreateTicket() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Technical");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setLoading(true);
    setError(null);

    try {
      const res = await authFetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, priority, message })
      });

      if (res.ok) {
        const data = await res.json();
        navigate(`/dashboard/support/${data.ticketId}`);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to create support ticket.");
      }
    } catch {
      setError("Connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans max-w-2xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Open Support Ticket</h2>
        <p className="text-xs text-zinc-500 font-medium">Explain your issue in detail, and our platform team will investigate.</p>
      </div>

      <DashboardCard title="Inquiry Specifications" subtitle="Ticket parameters">
        <form onSubmit={handleSubmit} className="space-y-4.5 pt-2">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-950/20 border border-red-500/10 text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Subject Title</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg px-3.5 py-2.5 text-xs font-semibold focus:outline-none"
              placeholder="e.g. Cannot bind custom domain address to VPS allocation"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg px-3.5 py-2.5 text-xs font-semibold focus:outline-none"
              >
                <option value="Technical">Technical Inquiries</option>
                <option value="Billing">Billing & Invoice Inquiries</option>
                <option value="Sales">Sales & Upgrades</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg px-3.5 py-2.5 text-xs font-semibold focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Detail Message</label>
            <textarea
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg px-3.5 py-2.5 text-xs font-semibold focus:outline-none resize-none leading-relaxed"
              placeholder="Explain the problem here, including any error logs or system actions..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => navigate("/dashboard/support")}
              className="bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-bold py-2 px-5 h-auto text-xs rounded-lg cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !subject || !message}
              className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-2 px-5 h-auto text-xs rounded-lg border-none cursor-pointer flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Submit Ticket"}
            </Button>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}
