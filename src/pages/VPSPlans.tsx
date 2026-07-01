import * as React from "react";
import PricingSection from "../components/PricingSection";
import { usePlans } from "../hooks/usePlans";
import { Loader2 } from "lucide-react";

export default function VPSPlans() {
  const { plans, loading } = usePlans("vps");

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
        title="VPS Hosting" 
        description="Scalable virtual private servers with full root access and NVMe storage." 
        plans={plans} 
        columns={3}
      />
    </div>
  );
}
