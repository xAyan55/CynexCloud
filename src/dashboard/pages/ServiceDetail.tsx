import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import DashboardCard from "../components/DashboardCard";
import SkeletonLoader from "../components/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, Database, Cpu, HardDrive } from "lucide-react";

interface ClientService {
  id: string;
  planId: string;
  name: string;
  status: string;
  price: number;
  billingCycle: string;
  nextRenewalDate?: string;
  pterodactylUuid?: string;
  createdAt: string;
}

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<ClientService | null>(null);
  const [panelUrl, setPanelUrl] = useState("");
  const [planDetails, setPlanDetails] = useState<any>(null);

  const fetchServiceDetails = async () => {
    try {
      const res = await authFetch(`/api/services/${id}`);
      const configRes = await authFetch("/api/panel/config");
      
      if (res.ok && configRes.ok) {
        const data = await res.json();
        const configData = await configRes.json();
        setService(data.service);
        setPanelUrl(configData.url || "");

        // Fetch plan details from storefront plans list to get resources details
        const plansRes = await authFetch("/api/plans");
        if (plansRes.ok) {
          const plans = await plansRes.json();
          const plan = plans.find((p: any) => p.id === data.service?.planId);
          setPlanDetails(plan || null);
        }
      } else {
        navigate("/dashboard/services");
      }
    } catch (err) {
      console.error("Failed to load service details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  if (loading) return <SkeletonLoader />;
  if (!service) return null;

  const handoffUrl = service.pterodactylUuid && panelUrl 
    ? `${panelUrl}/server/${service.pterodactylUuid}` 
    : null;

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans max-w-4xl mx-auto">
      {/* Title Header Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-850 pb-4">
        <button 
          onClick={() => navigate("/dashboard/services")}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO SERVICES</span>
        </button>

        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          service.status === "Active"
            ? "bg-emerald-500/10 text-emerald-400"
            : service.status === "Pending Payment"
              ? "bg-red-500/10 text-red-400"
              : "bg-zinc-950 border border-zinc-800 text-zinc-500"
        }`}>
          {service.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Business details */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="Service Overview" subtitle="Subscription detail statistics">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-2 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Service Name</span>
                <span className="font-semibold text-white block">{service.name}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Plan Name</span>
                <span className="font-semibold text-white block">{planDetails?.name || service.planId}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Cost Cycle</span>
                <span className="font-semibold text-white block">₹{service.price} / {service.billingCycle}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Next Renewal Date</span>
                <span className="font-semibold text-white block">
                  {service.nextRenewalDate ? new Date(service.nextRenewalDate).toLocaleDateString() : "Pending Activation"}
                </span>
              </div>
            </div>
          </DashboardCard>

          {/* Purchased limits display */}
          <DashboardCard title="Purchased Package Resource Allotments" subtitle="Static plan capabilities limits">
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-900 flex flex-col items-center justify-center text-center gap-2">
                <Cpu className="w-5 h-5 text-zinc-500" />
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Compute Cores</span>
                  <span className="text-xs font-bold text-white font-mono mt-0.5 block">{planDetails?.cpu || "1 Core"}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-900 flex flex-col items-center justify-center text-center gap-2">
                <Database className="w-5 h-5 text-zinc-500" />
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">DDR5 Memory</span>
                  <span className="text-xs font-bold text-white font-mono mt-0.5 block">{planDetails?.ram || "4 GB"}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-900 flex flex-col items-center justify-center text-center gap-2">
                <HardDrive className="w-5 h-5 text-zinc-500" />
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">NVMe Storage</span>
                  <span className="text-xs font-bold text-white font-mono mt-0.5 block">{planDetails?.storage || "10 GB"}</span>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Right Column: Console Actions Panel */}
        <div className="space-y-6">
          <DashboardCard title="Operations Control" subtitle="Secure operational handoff">
            <div className="space-y-4.5 pt-2 flex flex-col items-center text-center">
              <div className="p-3.5 rounded-full bg-zinc-950 border border-zinc-900 text-zinc-500">
                <Globe className="w-6 h-6" />
              </div>
              <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
                File browser, databases, terminal controls, and server properties are securely managed inside Pterodactyl Panel.
              </p>
              
              {handoffUrl ? (
                <a href={handoffUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-3.5 h-auto text-xs rounded-xl cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>Open Pterodactyl Panel</span>
                  </Button>
                </a>
              ) : (
                <Button disabled className="w-full bg-zinc-900 text-zinc-650 border border-zinc-850 font-bold py-3.5 h-auto text-xs rounded-xl cursor-not-allowed">
                  Panel Link Loading...
                </Button>
              )}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
