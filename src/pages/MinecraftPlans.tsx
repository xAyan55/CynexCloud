import * as React from "react";
import PricingSection from "../components/PricingSection";
import { usePlans } from "../hooks/usePlans";
import { Loader2 } from "lucide-react";

export default function MinecraftPlans() {
  const { plans, loading } = usePlans("minecraft");

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24">
      <PricingSection 
        title="Minecraft Hosting" 
        description="High-performance Minecraft server hosting with instant setup and 24/7 support." 
        plans={plans} 
      />
    </div>
  );
}
