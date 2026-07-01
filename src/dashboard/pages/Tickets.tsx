import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import DashboardCard from "../components/DashboardCard";
import DataTable, { Column } from "../components/DataTable";
import SkeletonLoader from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import { Button } from "@/components/ui/button";
import { HelpCircle, Plus, ChevronRight, MessageSquare } from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: "open" | "answered" | "closed";
  createdAt: string;
  updatedAt: string;
}

export default function Tickets() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const res = await authFetch("/api/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const columns: Column<Ticket>[] = [
    {
      key: "subject",
      label: "Subject",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-4 h-4 text-zinc-500" />
          <span className="font-bold text-white hover:underline cursor-pointer" onClick={() => navigate(`/dashboard/support/${row.id}`)}>
            {row.subject}
          </span>
        </div>
      )
    },
    { key: "category", label: "Category" },
    {
      key: "priority",
      label: "Priority",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          row.priority === "high" 
            ? "bg-red-500/10 text-red-400" 
            : row.priority === "medium" 
              ? "bg-yellow-500/10 text-yellow-400" 
              : "bg-zinc-950 border border-zinc-800 text-zinc-400"
        }`}>
          {row.priority}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          row.status === "open"
            ? "bg-emerald-500/10 text-emerald-400"
            : row.status === "answered"
              ? "bg-blue-500/10 text-blue-400"
              : "bg-zinc-950 border border-zinc-800 text-zinc-500"
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: "actions",
      label: "View",
      render: (row) => (
        <button
          onClick={() => navigate(`/dashboard/support/${row.id}`)}
          className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )
    }
  ];

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Support Tickets</h2>
          <p className="text-xs text-zinc-500 font-medium">Get assistance from our system engineers and platform developers.</p>
        </div>
        <Button
          onClick={() => navigate("/dashboard/support/create")}
          className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-2 px-4 h-auto text-xs rounded-lg transition-colors border-none flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Open Ticket</span>
        </Button>
      </div>

      {tickets.length > 0 ? (
        <DashboardCard title="Active Inquiries" subtitle="List of support cases opened by your profile">
          <div className="pt-2">
            <DataTable columns={columns} data={tickets} pageSize={5} />
          </div>
        </DashboardCard>
      ) : (
        <EmptyState
          title="No open support tickets"
          description="If you run into issues managing servers or configure details, our staff is here to help."
          icon={HelpCircle}
          actionLabel="Open Ticket"
          onAction={() => navigate("/dashboard/support/create")}
        />
      )}
    </div>
  );
}
