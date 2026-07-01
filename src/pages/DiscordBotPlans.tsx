import * as React from "react";
import PricingSection from "../components/PricingSection";
import { usePlans } from "../hooks/usePlans";
import { Loader2 } from "lucide-react";

export default function DiscordBotPlans() {
  const { plans, loading } = usePlans("discord");

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
        title="Discord Bot Hosting" 
        description="Reliable hosting for your Discord bots with support for Node.js, Python, and more." 
        plans={plans} 
        columns={3}
      />
    </div>
  );
}
