import React, { useState } from "react";
import DashboardCard from "../components/DashboardCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [newsAlerts, setNewsAlerts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Notification Settings</h2>
        <p className="text-xs text-zinc-500 font-medium">Configure preferences for emails, marketing updates, and security notifications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="Email Preferences" subtitle="Platform communication channels">
            <div className="space-y-5 pt-2">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Security Notifications</span>
                  <p className="text-[11px] text-zinc-550 leading-relaxed max-w-[400px]">Send email alerts immediately when new devices or login attempts are detected on your profile.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={loginAlerts} 
                  onChange={(e) => setLoginAlerts(e.target.checked)}
                  className="w-4 h-4 accent-white cursor-pointer"
                />
              </div>

              <div className="h-[1px] bg-zinc-850" />

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Resource & Deployment Alerts</span>
                  <p className="text-[11px] text-zinc-550 leading-relaxed max-w-[400px]">Send status changes when servers finish building, backups are generated, or support tickets receive staff responses.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailAlerts} 
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 accent-white cursor-pointer"
                />
              </div>

              <div className="h-[1px] bg-zinc-850" />

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Marketing & Product Updates</span>
                  <p className="text-[11px] text-zinc-550 leading-relaxed max-w-[400px]">Receive notifications about high-frequency node additions, performance configurations, and pricing discounts.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={newsAlerts} 
                  onChange={(e) => setNewsAlerts(e.target.checked)}
                  className="w-4 h-4 accent-white cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold py-2.5 px-5 h-auto text-xs rounded-lg transition-colors border-none flex items-center gap-2 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </Button>
                {saved && <span className="text-[10px] font-bold text-emerald-400">Settings saved successfully!</span>}
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Danger Zone" subtitle="Critical actions" className="border-red-950/30">
            <div className="space-y-4 pt-2">
              <div className="space-y-1 text-xs">
                <span className="font-bold text-white block">Deactivate Account</span>
                <p className="text-zinc-500 leading-relaxed">Permanently delete your profile and cancel all active servers. This action is irreversible.</p>
              </div>
              <Button className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs py-2 px-4 h-auto rounded-lg transition-colors cursor-pointer">
                Delete Account
              </Button>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
