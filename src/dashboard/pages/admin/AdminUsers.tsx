import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import DashboardCard from "../../components/DashboardCard";
import DataTable, { Column } from "../../components/DataTable";
import SkeletonLoader from "../../components/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  banned: number;
  createdAt: string;
}

export default function AdminUsers() {
  const { authFetch } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userActionId, setUserActionId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await authFetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to load users list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBan = async (user: AdminUser) => {
    setUserActionId(user.id);
    try {
      const res = await authFetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: !user.banned })
      });
      if (res.ok) {
        fetchUsers();
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
        fetchUsers();
      }
    } catch (err) {
      console.error("Failed to update user role:", err);
    } finally {
      setUserActionId(null);
    }
  };

  const columns: Column<AdminUser>[] = [
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
        <h2 className="text-xl font-bold text-white tracking-tight">User Profiles</h2>
        <p className="text-xs text-zinc-500 font-medium">Manage user permissions, account roles, and status bans.</p>
      </div>

      <DashboardCard title="Registered Users" subtitle="Manage registered CynexCloud user accounts">
        <div className="pt-2">
          <DataTable columns={columns} data={users} pageSize={8} />
        </div>
      </DashboardCard>
    </div>
  );
}
