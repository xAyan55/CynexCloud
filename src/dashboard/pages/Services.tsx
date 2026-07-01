import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import SkeletonLoader from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import { Gamepad2, Plus, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientService {
  id: string;
  planId: string;
  name: string;
  status: string;
  price: number;
  createdAt: string;
}

export default function Services() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<ClientService[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const res = await authFetch("/api/services");
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch (err) {
      console.error("Failed to load services list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-850 pb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Active Services</h2>
          <p className="text-xs text-zinc-500 font-medium">Manage and audit your active hosting service subscriptions.</p>
        </div>
        <Button
          onClick={() => navigate("/dashboard/deploy")}
          className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-2 px-4 h-auto text-xs rounded-lg transition-colors border-none flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Order Service</span>
        </Button>
      </div>

      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              onClick={() => navigate(`/dashboard/services/${srv.id}`)}
              className="flex flex-col justify-between p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-white/[0.01] hover:border-zinc-700 transition-all cursor-pointer group gap-5"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate block">{srv.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      srv.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : srv.status === "Pending Payment"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-zinc-950 border border-zinc-800 text-zinc-500"
                    }`}>
                      {srv.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-semibold block uppercase tracking-wider">
                    Plan ID: {srv.planId}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-500 group-hover:text-white transition-colors shrink-0">
                  <Gamepad2 className="w-5 h-5" />
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-zinc-850/60 pt-4 text-[10px] font-bold text-zinc-500 tracking-wider">
                <span>COST: ₹{srv.price}/mo</span>
                <span className="flex items-center gap-1 text-zinc-400 group-hover:text-white transition-colors">
                  <span>MANAGE</span>
                  <Terminal className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No services active"
          description="You haven't ordered any high-frequency game servers or virtual machines yet."
          icon={Gamepad2}
        />
      )}
    </div>
  );
}
