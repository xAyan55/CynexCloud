import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Database, Cpu, RotateCcw, Info, Check, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "./CustomTooltip";
import { PricingPlan } from "../types";
import { FEATURE_DESCRIPTIONS } from "../featureDescriptions";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";


interface PricingSectionProps {
  title: string;
  description: string;
  plans: PricingPlan[];
  id?: string;
  columns?: number;
}

export default function PricingSection({ title, description, plans, id = "pricing", columns = 3 }: PricingSectionProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [provisioningId, setProvisioningId] = useState<string | null>(null);
  const [successPlan, setSuccessPlan] = useState<PricingPlan | null>(null);
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");
  const [namingPlan, setNamingPlan] = useState<PricingPlan | null>(null);
  const [serviceNameInput, setServiceNameInput] = useState("");
  const [orderError, setOrderError] = useState<string | null>(null);

  // Custom Builder Spec States
  const [customRam, setCustomRam] = useState(8); // in GB
  const [customCpu, setCustomCpu] = useState(4);  // in vCPUs
  const [customStorage, setCustomStorage] = useState(100); // in GB

  // On-the-fly Price calculation
  // Base price 150 + RAM 110/GB + CPU 170/vCPU + Disk 1.2/GB
  const customPrice = Math.round(150 + (customRam * 110) + (customCpu * 170) + (customStorage * 1.2));

  const getPerformanceProfile = () => {
    if (customRam <= 4) {
      return { 
        label: "Starter Profile", 
        desc: "Best for light bots, development environments, and small 1-5 player vanilla game sessions.",
        color: "text-zinc-400 bg-zinc-950 border-zinc-800"
      };
    }
    if (customRam <= 8) {
      return { 
        label: "Optimized Core", 
        desc: "Ideal for small communities, heavily-modded Discord bots, or vanilla servers with 10-20 active players.",
        color: "text-indigo-400 bg-indigo-950/40 border-indigo-900/30"
      };
    }
    if (customRam <= 16) {
      return { 
        label: "Performance Grid", 
        desc: "Excellent for professional production bots, medium game networks with multiple plugins, or standard VPS workloads.",
        color: "text-emerald-400 bg-emerald-950/40 border-emerald-900/30"
      };
    }
    return { 
      label: "Extreme Enterprise", 
      desc: "Maximum reliability and computation power for massive BungeeCord networks, heavy databases, or critical production APIs.",
      color: "text-white bg-zinc-900 border-white/10"
    };
  };

  const handleProvision = (plan: PricingPlan) => {
    if (!user) {
      sessionStorage.setItem("selectedPlanId", plan.id);
      navigate("/auth");
      return;
    }
    setNamingPlan(plan);
    setServiceNameInput("");
    setOrderError(null);
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namingPlan || !serviceNameInput.trim()) return;
    setProvisioningId(namingPlan.id);
    setOrderError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: namingPlan.id,
          serviceName: serviceNameInput
        })
      });

      if (res.ok) {
        setNamingPlan(null);
        navigate("/dashboard/invoices");
      } else {
        const err = await res.json();
        setOrderError(err.error || "Failed to submit order.");
      }
    } catch {
      setOrderError("Network connection error.");
    } finally {
      setProvisioningId(null);
    }
  };

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[Math.min(columns, 4) as 1|2|3|4];

  const currentProfile = getPerformanceProfile();

  return (
    <section id={id} className="py-16 md:py-32 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-3xl sm:text-5xl md:text-8xl font-black mb-4 md:mb-6 tracking-tighter uppercase font-heading text-gradient">
            {title}
          </h2>
          <p className="text-zinc-600 max-w-xl mx-auto text-sm sm:text-base md:text-lg font-medium italic">
            {description}
          </p>
        </motion.div>

        {/* Dynamic Selector Tabs */}
        <div className="flex justify-center mb-16">
          <div className="bg-zinc-950 border border-white/5 p-1.5 rounded-2xl flex shadow-2xl">
            <button
              onClick={() => setActiveTab("presets")}
              className={`px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === "presets" 
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]" 
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              PRESET PACKAGES
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === "custom" 
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]" 
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              CUSTOM BUILDER
            </button>
          </div>
        </div>

        {/* Tab content rendering */}
        <AnimatePresence mode="wait">
          {activeTab === "presets" ? (
            <motion.div
              key="presets-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className={`grid ${gridCols} gap-6 md:gap-10 max-w-[1600px] mx-auto justify-items-center justify-center w-full`}
            >
              {plans.map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.6 }}
                  className="flex flex-col h-full w-full max-w-[420px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.025] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                >
                  {/* Popular Banner */}
                  {plan.popular && (
                    <div className="bg-white text-black text-[10px] font-black py-2.5 px-6 rounded-t-3xl text-center tracking-[0.4em] uppercase shadow-[0_-10px_30px_rgba(255,255,255,0.1)]">
                      {plan.popularText || "BEST VALUE"}
                    </div>
                  )}

                  <div className={`flex-1 border-gradient ${plan.popular ? 'rounded-b-3xl shadow-[0_0_50px_rgba(255,255,255,0.05)]' : 'rounded-3xl'} p-5 sm:p-10 flex flex-col gap-6 sm:gap-8 relative group transition-all duration-700 hover:border-white/20 hover:bg-zinc-900/10 glass`}>
                    
                    {/* Glow Effect */}
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Header: Icon + Name + RAM */}
                    <div className="flex items-start gap-4 sm:gap-6">
                      <div className="relative">
                        <div className="w-14 h-14 sm:w-20 sm:h-20 bg-zinc-900 rounded-2xl flex items-center justify-center overflow-hidden border border-white/5 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                          {plan.iconUrl || (plan as any).image ? (
                            <img 
                              src={plan.iconUrl || (plan as any).image} 
                              alt={plan.name} 
                              className="w-full h-full object-cover transition-all duration-700" 
                              referrerPolicy="no-referrer" 
                            />
                          ) : (
                            <div className="w-9 h-9 bg-zinc-800 rounded-lg" />
                          )}
                        </div>
                      </div>
                      <div className="pt-1">
                        <h3 className="text-white font-black text-base sm:text-xl uppercase tracking-tighter leading-none mb-1 sm:mb-2 font-heading">{plan.name}</h3>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl sm:text-3xl font-black text-white tracking-tighter">{plan.ram}</span>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-white/5" />

                    {/* Description */}
                    <p className="text-zinc-400 text-sm leading-relaxed min-h-[48px] font-medium">
                      {plan.description}
                    </p>

                    {/* Features Box */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 space-y-4 sm:space-y-5 glass-dark">
                      <Tooltip content={FEATURE_DESCRIPTIONS["Storage"]} className="w-full relative block">
                        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-[13px] text-zinc-300 font-semibold uppercase tracking-wider cursor-help group/feat">
                          <Database className="w-4 h-4 text-zinc-500 group-hover/feat:text-white transition-colors" />
                          <span className="flex-1 text-left truncate">{plan.storage || (plan as any).disk}</span>
                          <Info className="w-3 h-3 text-zinc-700 ml-auto opacity-0 group-hover/feat:opacity-100 transition-opacity" />
                        </div>
                      </Tooltip>

                      <Tooltip content={FEATURE_DESCRIPTIONS["CPU"]} className="w-full relative block">
                        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-[13px] text-zinc-300 font-semibold uppercase tracking-wider cursor-help group/feat">
                          <Cpu className="w-4 h-4 text-zinc-500 group-hover/feat:text-white transition-colors" />
                          <span className="flex-1 text-left truncate">{plan.cpu}</span>
                          <Info className="w-3 h-3 text-zinc-700 ml-auto opacity-0 group-hover/feat:opacity-100 transition-opacity" />
                        </div>
                      </Tooltip>

                      {plan.features.map((feature, j) => (
                        <div key={j} className="w-full">
                          <Tooltip content={FEATURE_DESCRIPTIONS[feature] || "Premium feature included with this plan."} className="w-full relative block">
                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-[13px] text-zinc-300 font-semibold uppercase tracking-wider cursor-help group/feat">
                              <RotateCcw className="w-4 h-4 text-zinc-500 group-hover/feat:text-white transition-colors" />
                              <span className="flex-1 text-left truncate">{feature}</span>
                              <Info className="w-3 h-3 text-zinc-700 ml-auto opacity-0 group-hover/feat:opacity-100 transition-opacity" />
                            </div>
                          </Tooltip>
                        </div>
                      ))}
                    </div>

                    {/* Pricing + CTA */}
                    <div className="mt-auto pt-6 flex flex-col gap-4">
                      <div className="flex flex-col">
                        {plan.originalPrice && (
                          <span className="text-zinc-600 text-[10px] line-through font-black mb-0.5 tracking-wider uppercase">₹{plan.originalPrice}</span>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter">₹{plan.price}</span>
                          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">/mo</span>
                        </div>
                      </div>
                      
                      <Button 
                        disabled={provisioningId !== null}
                        onClick={() => handleProvision(plan)}
                        className="w-full bg-white text-black hover:bg-[var(--color-brand)] hover:text-black font-black py-4 rounded-xl transition-all duration-300 uppercase tracking-widest text-[10px] h-auto border-none hover:scale-[1.01] active:scale-[0.98]"
                      >
                        {provisioningId === plan.id ? "Deploying..." : "Deploy Now"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="custom-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-zinc-950/40 rounded-[2.5rem] border border-white/5 p-6 sm:p-10 md:p-12"
            >
              {/* Sliders Area */}
              <div className="lg:col-span-7 space-y-8">
                <div>
                  <h3 className="text-xl font-black uppercase font-heading tracking-tight mb-2 text-white">Configure Infrastructure</h3>
                  <p className="text-zinc-500 text-xs font-semibold leading-relaxed">
                    Slide or select a quick template to build your custom virtual environment. Our system calculates pricing in real-time.
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Quick Config Templates</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { name: "Sandbox Node", ram: 4, cpu: 2, storage: 60, icon: "🌱" },
                      { name: "Pro Gaming", ram: 12, cpu: 4, storage: 120, icon: "🎮" },
                      { name: "Cluster Sync", ram: 24, cpu: 8, storage: 240, icon: "⛓️" },
                      { name: "Titan Host", ram: 48, cpu: 12, storage: 450, icon: "⚡" }
                    ].map((preset) => {
                      const isCurrent = customRam === preset.ram && customCpu === preset.cpu && customStorage === preset.storage;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setCustomRam(preset.ram);
                            setCustomCpu(preset.cpu);
                            setCustomStorage(preset.storage);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-24 relative overflow-hidden group/preset ${
                            isCurrent 
                              ? "bg-white border-white text-black shadow-lg scale-102" 
                              : "bg-zinc-950 border-white/5 text-zinc-300 hover:border-white/10 hover:bg-zinc-900/60"
                          }`}
                        >
                          <span className="text-lg">{preset.icon}</span>
                          <div>
                            <div className="font-bold text-[10px] uppercase tracking-tight leading-tight line-clamp-1">{preset.name}</div>
                            <div className={`text-[9px] mt-0.5 font-mono ${isCurrent ? "text-zinc-600" : "text-zinc-500"}`}>
                              {preset.ram}G / {preset.cpu}C / {preset.storage}G
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* RAM Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">DDR5 High-Speed RAM</span>
                    <span className="text-xl font-black text-white font-heading">{customRam} GB</span>
                  </div>
                  <input 
                    type="range" 
                    min="2" 
                    max="64" 
                    step="2" 
                    value={customRam} 
                    onChange={(e) => setCustomRam(Number(e.target.value))}
                    className="w-full accent-white h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-600 font-bold">
                    <span>2 GB</span>
                    <span>16 GB</span>
                    <span>32 GB</span>
                    <span>48 GB</span>
                    <span>64 GB</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[4, 8, 16, 32, 64].map((v) => (
                      <button 
                        key={v}
                        onClick={() => setCustomRam(v)}
                        className={`px-3 py-1 text-[10px] font-black rounded-lg border transition-all ${
                          customRam === v 
                            ? "bg-white text-black border-white" 
                            : "bg-zinc-950 text-zinc-400 border-white/5 hover:border-white/10"
                        }`}
                      >
                        {v}GB
                      </button>
                    ))}
                  </div>
                </div>

                {/* CPU Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">AMD Ryzen 9 Cores</span>
                    <span className="text-xl font-black text-white font-heading">{customCpu} Cores</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="16" 
                    step="1" 
                    value={customCpu} 
                    onChange={(e) => setCustomCpu(Number(e.target.value))}
                    className="w-full accent-white h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-600 font-bold">
                    <span>1 CORE</span>
                    <span>4 CORES</span>
                    <span>8 CORES</span>
                    <span>12 CORES</span>
                    <span>16 CORES</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[2, 4, 8, 12, 16].map((v) => (
                      <button 
                        key={v}
                        onClick={() => setCustomCpu(v)}
                        className={`px-3 py-1 text-[10px] font-black rounded-lg border transition-all ${
                          customCpu === v 
                            ? "bg-white text-black border-white" 
                            : "bg-zinc-950 text-zinc-400 border-white/5 hover:border-white/10"
                        }`}
                      >
                        {v} Cores
                      </button>
                    ))}
                  </div>
                </div>

                {/* Storage Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Enterprise NVMe SSD Disk</span>
                    <span className="text-xl font-black text-white font-heading">{customStorage} GB</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="500" 
                    step="10" 
                    value={customStorage} 
                    onChange={(e) => setCustomStorage(Number(e.target.value))}
                    className="w-full accent-white h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-600 font-bold">
                    <span>10 GB</span>
                    <span>120 GB</span>
                    <span>240 GB</span>
                    <span>360 GB</span>
                    <span>500 GB</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[50, 100, 200, 300, 500].map((v) => (
                      <button 
                        key={v}
                        onClick={() => setCustomStorage(v)}
                        className={`px-3 py-1 text-[10px] font-black rounded-lg border transition-all ${
                          customStorage === v 
                            ? "bg-white text-black border-white" 
                            : "bg-zinc-950 text-zinc-400 border-white/5 hover:border-white/10"
                        }`}
                      >
                        {v}GB NVMe
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Preview & Price Area */}
              <div className="lg:col-span-5 bg-black/40 border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.015] hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] pointer-events-none" />

                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2">Live Node Profile</span>
                    <div className={`inline-block border px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${currentProfile.color}`}>
                      {currentProfile.label}
                    </div>
                    <p className="text-zinc-500 text-xs mt-3 leading-relaxed font-semibold">
                      {currentProfile.desc}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-5 space-y-3 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 uppercase">MEMORY</span>
                      <span className="text-white font-bold">{customRam} GB DDR5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 uppercase">COMPUTE</span>
                      <span className="text-white font-bold">{customCpu} Ryzen Cores</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 uppercase">STORAGE</span>
                      <span className="text-white font-bold">{customStorage} GB NVMe SSD</span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 lg:mt-0 space-y-6">
                  <div className="flex items-baseline justify-between border-t border-white/5 pt-6">
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Dynamic Price</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-black text-white font-heading tracking-tighter">₹{customPrice}</span>
                      <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">/mo</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate(user ? "/dashboard/support" : "/auth")}
                    className="w-full bg-white text-black hover:bg-zinc-200 font-black py-5 sm:py-6 rounded-2xl transition-all duration-500 uppercase tracking-[0.2em] text-[10px] h-auto border-none hover:scale-[1.03] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                  >
                    Request Custom Quote
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Order Success Modal */}

      {/* Order Success Modal */}
      <AnimatePresence>
        {successPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 max-w-md w-full relative overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)]"
            >
              <button 
                onClick={() => setSuccessPlan(null)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  <ShieldCheck className="w-8 h-8 text-black" />
                </div>

                <h3 className="text-2xl font-black uppercase font-heading tracking-tight mb-2">Order Completed</h3>
                <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                  Your demo node is configured and initialized successfully on our server grid.
                </p>

                <div className="w-full bg-zinc-900/50 border border-zinc-900 rounded-2xl p-4 mb-8 text-left space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase">Package</span>
                    <span className="text-white font-bold">{successPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase">Pricing</span>
                    <span className="text-white font-bold">₹{successPlan.price}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase">Memory</span>
                    <span className="text-white font-bold">{successPlan.ram}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase">CPU</span>
                    <span className="text-white font-bold">{successPlan.cpu}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setSuccessPlan(null)}
                  className="w-full bg-white text-black hover:bg-zinc-200 font-bold rounded-2xl py-6 uppercase tracking-widest text-xs h-auto"
                >
                  Continue Browsing
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Service Naming Modal */}
      <AnimatePresence>
        {namingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 max-w-md w-full relative overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)]"
            >
              <button 
                onClick={() => setNamingPlan(null)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <form onSubmit={handleConfirmOrder} className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  <Database className="w-8 h-8 text-black" />
                </div>

                <div>
                  <h3 className="text-2xl font-black uppercase font-heading tracking-tight mb-2">Name Your Service</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed font-semibold">
                    Give your new {namingPlan.name} a friendly display name to identify it in your services dashboard.
                  </p>
                </div>

                {orderError && (
                  <div className="p-3 w-full rounded-lg bg-red-950/20 border border-red-500/10 text-red-400 text-[10px] font-bold text-center">
                    {orderError}
                  </div>
                )}

                <div className="w-full text-left space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Service Name</label>
                  <input
                    type="text"
                    required
                    value={serviceNameInput}
                    onChange={(e) => setServiceNameInput(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-zinc-700"
                    placeholder="e.g. Lobby Survival"
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={provisioningId !== null || !serviceNameInput.trim()}
                  className="w-full bg-white text-black hover:bg-zinc-200 font-bold rounded-2xl py-6 uppercase tracking-widest text-xs h-auto cursor-pointer"
                >
                  {provisioningId ? "Creating Order..." : "Confirm & Create Invoice"}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-[1px] w-full ${className}`} />;
}
