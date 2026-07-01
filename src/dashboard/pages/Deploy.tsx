import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../components/DashboardCard";
import { Button } from "@/components/ui/button";
import { Gamepad2, Server, HelpCircle, ArrowRight, Loader2, Check } from "lucide-react";
import config from "../../config.json";

export default function Deploy() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [serverType, setServerType] = useState<"minecraft" | "vps">("minecraft");
  const [serverName, setServerName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [location, setLocation] = useState("EU-GER-01");
  const [deploying, setDeploying] = useState(false);

  // Load plans from configuration
  const mcPlans = config.minecraftPlans || [];
  const vpsPlans = [
    { id: "vps-dev", name: "Cloud Dev", price: "$7.50/mo", ram: "1 GB", cpu: "1 Core", disk: "20 GB NVMe" },
    { id: "vps-pro", name: "Cloud Pro", price: "$15.00/mo", ram: "2 GB", cpu: "2 Cores", disk: "40 GB NVMe" },
    { id: "vps-ent", name: "Cloud Enterprise", price: "$30.00/mo", ram: "4 GB", cpu: "4 Cores", disk: "80 GB NVMe" }
  ];

  const plans = serverType === "minecraft" ? mcPlans : vpsPlans;

  const handleDeploy = () => {
    if (!serverName || !selectedPlan) return;
    setDeploying(true);

    // Mock server build pipeline delay
    setTimeout(() => {
      setDeploying(false);
      navigate("/dashboard/servers");
    }, 2000);
  };

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans max-w-4xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Deploy New Instance</h2>
        <p className="text-xs text-zinc-500 font-medium">Create a high-frequency game server or a dedicated cloud VPS instantly.</p>
      </div>

      {/* Steps indicators */}
      <div className="flex items-center justify-between border-b border-zinc-850 pb-4 text-xs font-bold text-zinc-500 tracking-wider">
        <span className={step >= 1 ? "text-white" : ""}>1. SELECT TYPE</span>
        <ArrowRight className="w-3.5 h-3.5" />
        <span className={step >= 2 ? "text-white" : ""}>2. CHOOSE PLAN</span>
        <ArrowRight className="w-3.5 h-3.5" />
        <span className={step >= 3 ? "text-white" : ""}>3. CONFIGURE & DEPLOY</span>
      </div>

      {/* Step 1: Select Type */}
      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          <div 
            onClick={() => {
              setServerType("minecraft");
              setStep(2);
            }}
            className="flex flex-col items-center justify-center p-8 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-white/[0.01] hover:border-zinc-700 text-center transition-all cursor-pointer group gap-4"
          >
            <div className="p-3.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-500 group-hover:text-white transition-colors">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Minecraft Spigot / Bungee</span>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">High performance game server</span>
            </div>
          </div>

          <div 
            onClick={() => {
              setServerType("vps");
              setStep(2);
            }}
            className="flex flex-col items-center justify-center p-8 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-white/[0.01] hover:border-zinc-700 text-center transition-all cursor-pointer group gap-4"
          >
            <div className="p-3.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-500 group-hover:text-white transition-colors">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Linux Cloud VPS</span>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Root-access virtual machine</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Select Plan */}
      {step === 2 && (
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {plans.map((plan: any) => {
              const active = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-48 ${
                    active 
                      ? "border-white bg-white/[0.02]" 
                      : "border-zinc-850 bg-zinc-900/40 hover:border-zinc-750"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white truncate max-w-[80%]">{plan.name}</span>
                      {active && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      RAM: {plan.ram} / CPU: {plan.cpu} <br />
                      Disk: {plan.disk || plan.storage || "20 GB"}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-white">
                    {plan.price}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setStep(1)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-bold py-2 px-5 h-auto text-xs rounded-lg cursor-pointer"
            >
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!selectedPlan}
              className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-2 px-5 h-auto text-xs rounded-lg border-none cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Configure & Deploy */}
      {step === 3 && (
        <div className="space-y-6 pt-2">
          <DashboardCard title="Instance Configurations" subtitle="Finalize parameters">
            <div className="space-y-4.5 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Instance Name</label>
                <input
                  type="text"
                  required
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg px-3.5 py-2.5 text-xs font-semibold focus:outline-none"
                  placeholder="e.g. survival-lobby-1"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Deploy Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg px-3.5 py-2.5 text-xs font-semibold focus:outline-none"
                >
                  <option value="EU-GER-01">Frankfurt, Germany (Central Europe)</option>
                  <option value="US-NYC-01">New York City, USA (East Coast)</option>
                </select>
              </div>
            </div>
          </DashboardCard>

          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setStep(2)}
              disabled={deploying}
              className="bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-bold py-2 px-5 h-auto text-xs rounded-lg cursor-pointer"
            >
              Back
            </Button>
            <Button
              onClick={handleDeploy}
              disabled={deploying || !serverName}
              className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-2 px-5 h-auto text-xs rounded-lg border-none cursor-pointer flex items-center gap-1.5"
            >
              {deploying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Provisioning Node...</span>
                </>
              ) : (
                <span>Deploy Server</span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
