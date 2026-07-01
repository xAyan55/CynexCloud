import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import DashboardCard from "../../components/DashboardCard";
import DataTable, { Column } from "../../components/DataTable";
import SkeletonLoader from "../../components/SkeletonLoader";
import EmptyState from "../../components/EmptyState";
import { HelpCircle, ChevronRight, MessageSquare } from "lucide-react";

interface AdminTicket {
  id: string;
  userId: string;
  subject: string;
  category: string;
  priority: string;
  status: "open" | "answered" | "closed";
  createdAt: string;
  updatedAt: string;
  username: string;
  email: string;
}

export default function AdminTickets() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllTickets = async () => {
    try {
      const res = await authFetch("/api/admin/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("Failed to load admin tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const columns: Column<AdminTicket>[] = [
    {
      key: "subject",
      label: "Subject",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-4 h-4 text-zinc-500" />
          <span className="font-bold text-white hover:underline cursor-pointer" onClick={() => navigate(`/dashboard/admin/tickets/${row.id}`)}>
            {row.subject}
          </span>
        </div>
      )
    },
    {
      key: "username",
      label: "Opened By",
      render: (row) => (
        <div>
          <span className="font-bold text-white block">{row.username || "Unknown"}</span>
          <span className="text-[10px] text-zinc-500 font-semibold">{row.email}</span>
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
      label: "Manage",
      render: (row) => (
        <button
          onClick={() => navigate(`/dashboard/admin/tickets/${row.id}`)}
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
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Manage User Inquiries</h2>
        <p className="text-xs text-zinc-500 font-medium">Review and reply to support requests opened across the platform.</p>
      </div>

      {tickets.length > 0 ? (
        <DashboardCard title="All Support Tickets" subtitle="Inquiries history list">
          <div className="pt-2">
            <DataTable columns={columns} data={tickets} pageSize={8} />
          </div>
        </DashboardCard>
      ) : (
        <EmptyState
          title="No support tickets opened"
          description="Users haven't submitted any technical or billing support inquiries yet."
          icon={HelpCircle}
        />
      )}
    </div>
  );
}
