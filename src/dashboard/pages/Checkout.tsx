import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Layers, 
  Check, 
  ArrowRight, 
  ShieldAlert, 
  Coins, 
  Loader2,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationOption {
  id: string | number;
  name: string;
  country: string;
  city: string;
  ping: string;
  flag: string;
  totalRam: number;
  availableRam: number;
  totalDisk: number;
  availableDisk: number;
  isOnline: boolean;
}

interface SoftwareOption {
  id: string;
  eggId: number;
  nestId: number;
  game: string;
  name: string;
  versions: string[];
}

interface AddonOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface BillingCycleOption {
  id: string;
  name: string;
  months: number;
  discount: number;
}

interface CalculationResult {
  basePrice: number;
  months: number;
  baseSubtotal: number;
  addonsTotal: number;
  subtotal: number;
  cycleDiscountAmount: number;
  couponDiscountAmount: number;
  discountAmount: number;
  discountPct: number;
  taxAmount: number;
  total: number;
  recurringPrice: number;
}

export default function Checkout() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { user, authFetch } = useAuth();

  // State configurations loaded from API
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [softwareList, setSoftwareList] = useState<SoftwareOption[]>([]);
  const [addonsList, setAddonsList] = useState<AddonOption[]>([]);
  const [cycles, setCycles] = useState<BillingCycleOption[]>([]);

  // Customer choices
  const [step, setStep] = useState(1); // 1 = Config, 2 = Review
  const [serverName, setServerName] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [selectedLoc, setSelectedLoc] = useState<string>("");
  const [selectedSoftware, setSelectedSoftware] = useState<string>("");
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [selectedCycle, setSelectedCycle] = useState<string>("monthly");
  const [activeAddons, setActiveAddons] = useState<string[]>([]);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [activeCoupon, setActiveCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  // Live calculation details
  const [calc, setCalc] = useState<CalculationResult | null>(null);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Load configuration options and plan details
  useEffect(() => {
    const initCheckout = async () => {
      try {
        // Fetch plans to find selected plan
        const plansRes = await fetch("/api/plans");
        const plans = await plansRes.json();
        const plan = plans.find((p: any) => p.id === planId);
        if (!plan) {
          setCheckoutError("The selected plan configuration was not found.");
          setLoadingConfig(false);
          return;
        }
        setPlanDetails(plan);

        // Fetch config details
        const configRes = await fetch("/api/checkout/config");
        const configData = await configRes.json();
        if (configData.success) {
          setLocations(configData.locations || []);
          setSoftwareList(configData.software || []);
          setAddonsList(configData.addons || []);
          setCycles(configData.cycles || []);

          // Set default selections
          if (configData.locations.length > 0) {
            setSelectedLoc(String(configData.locations[0].id));
          }

          if (configData.software.length > 0) {
            // Find unique games
            const uniqueGames = Array.from(new Set(configData.software.map((s: any) => s.game || "Minecraft")));
            const defaultGame = uniqueGames[0] || "Minecraft";
            setSelectedGame(defaultGame);

            // Filter software list by game
            const gameSoftwares = configData.software.filter((s: any) => (s.game || "Minecraft") === defaultGame);
            if (gameSoftwares.length > 0) {
              setSelectedSoftware(gameSoftwares[0].id);
              setSelectedVersion(gameSoftwares[0].versions[0]);
            }
          }
        }
      } catch (err) {
        console.error(err);
        setCheckoutError("Failed to establish server connection for checkout configurations.");
      } finally {
        setLoadingConfig(false);
      }
    };

    initCheckout();
  }, [planId]);

  // Recalculate price whenever cycle, add-ons or active coupon change
  useEffect(() => {
    if (loadingConfig || !planId) return;

    const runPriceCalculation = async () => {
      setLoadingCalc(true);
      try {
        const res = await fetch("/api/checkout/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId,
            billingCycle: selectedCycle,
            selectedAddons: activeAddons,
            coupon: activeCoupon
          })
        });
        const data = await res.json();
        if (data.success) {
          setCalc(data.calculation);
        }
      } catch (err) {
        console.error("Price check failed:", err);
      } finally {
        setLoadingCalc(false);
      }
    };

    runPriceCalculation();
  }, [selectedCycle, activeAddons, planId, loadingConfig, activeCoupon]);

  // Handle Game selection change
  const handleGameChange = (game: string) => {
    setSelectedGame(game);
    const gameSoftwares = softwareList.filter((s) => (s.game || "Minecraft") === game);
    if (gameSoftwares.length > 0) {
      setSelectedSoftware(gameSoftwares[0].id);
      setSelectedVersion(gameSoftwares[0].versions[0]);
    } else {
      setSelectedSoftware("");
      setSelectedVersion("");
    }
  };

  // Handle Software change (resets default version)
  const handleSoftwareChange = (swId: string) => {
    setSelectedSoftware(swId);
    const sw = softwareList.find((s) => s.id === swId);
    if (sw && sw.versions.length > 0) {
      setSelectedVersion(sw.versions[0]);
    }
  };

  // Toggle addons selection
  const handleToggleAddon = (addonId: string) => {
    setActiveAddons((prev) => 
      prev.includes(addonId) 
        ? prev.filter((id) => id !== addonId) 
        : [...prev, addonId]
    );
  };

  // Handle Applying Coupon
  const handleApplyCoupon = () => {
    setCouponMessage("");
    const normalized = couponInput.toUpperCase().trim();
    if (!normalized) {
      setActiveCoupon("");
      return;
    }

    if (normalized === "CYNEX20") {
      setActiveCoupon("CYNEX20");
      setCouponMessage("Coupon applied: 20% discount on entire cart total!");
    } else if (normalized === "START10") {
      setActiveCoupon("START10");
      setCouponMessage("Coupon applied: 10% discount!");
    } else {
      setActiveCoupon("");
      setCouponMessage("Invalid promo code.");
    }
  };

  const handleNextStep = () => {
    setCheckoutError(null);
    if (!serverName.trim()) {
      setCheckoutError("Please enter a friendly name for your server.");
      return;
    }
    if (!selectedLoc) {
      setCheckoutError("Please select a physical server node location.");
      return;
    }
    if (!selectedSoftware || !selectedVersion) {
      setCheckoutError("Please specify a software and version mapping.");
      return;
    }

    // Check authentication
    if (!user) {
      const params = new URLSearchParams({
        redirect: window.location.pathname + window.location.search
      });
      navigate(`/auth?${params.toString()}`);
      return;
    }

    setStep(2);
  };

  const handleCreateCheckoutOrder = async () => {
    if (!agreeTerms) {
      setCheckoutError("You must read and agree to the Terms of Service.");
      return;
    }

    setSubmittingOrder(true);
    setCheckoutError(null);

    try {
      // 1. Submit Order to Checkout Pipeline
      const orderRes = await authFetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          serverName,
          billingCycle: selectedCycle,
          locationId: selectedLoc,
          softwareId: selectedSoftware,
          version: selectedVersion,
          selectedAddons: activeAddons,
          coupon: activeCoupon
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Order generation failed.");
      }

      // 2. Generate OxaPay checkout link directly
      const payRes = await authFetch("/api/payments/oxapay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: orderData.invoiceId })
      });

      const payData = await payRes.json();
      if (!payRes.ok || !payData.payUrl) {
        throw new Error(payData.error || "Failed to initialize payment gateway.");
      }

      // Redirect client to OxaPay Gateway checkout
      window.location.href = payData.payUrl;
    } catch (err: any) {
      setCheckoutError(err.message || "An unexpected error occurred during order routing.");
      setSubmittingOrder(false);
    }
  };

  const selectedLocDetails = locations.find(l => String(l.id) === String(selectedLoc));
  const selectedSoftwareDetails = softwareList.find(s => s.id === selectedSoftware);
  const selectedCycleDetails = cycles.find(c => c.id === selectedCycle);

  // Extract unique games for the first dropdown filter
  const uniqueGames = Array.from(new Set(softwareList.map(s => s.game || "Minecraft")));
  
  // Filter software options based on the selected game
  const filteredSoftwareOptions = softwareList.filter(s => (s.game || "Minecraft") === selectedGame);

  // Check if configuration is complete to enable Continue button
  const isConfigComplete = 
    serverName.trim() !== "" && 
    selectedLoc !== "" && 
    selectedSoftware !== "" && 
    selectedVersion !== "" && 
    selectedCycle !== "";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans select-none text-zinc-300">
      
      {/* Checkout Navigation Steps bar */}
      <div className="flex items-center justify-between mb-10 border-b border-zinc-900 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Checkout</h2>
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Premium Cloud Provisioning Pipeline</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
          <span className={step === 1 ? "text-white" : "text-zinc-500"}>1. Configure</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-650" />
          <span className={step === 2 ? "text-white" : "text-zinc-500"}>2. Review & Pay</span>
        </div>
      </div>

      {checkoutError && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/10 bg-red-950/20 text-red-400 text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{checkoutError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Checkout Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 ? (
            <>
              {/* Plan Information Card */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-white">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{planDetails?.name}</h3>
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Base Package Specifications</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-zinc-900">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-zinc-550 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block">Memory</span>
                      <span className="text-xs font-bold text-white">{planDetails?.ram}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-zinc-550 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold text-zinc-555 uppercase tracking-widest block">Processor</span>
                      <span className="text-xs font-bold text-white">{planDetails?.cpu || "Epyc vCores"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-zinc-550 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block">Storage</span>
                      <span className="text-xs font-bold text-white">{planDetails?.storage || planDetails?.disk}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Server Name input card */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">1. Identify Server</h4>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Specify a friendly identifier for the control panel</p>
                </div>
                <input
                  type="text"
                  placeholder="e.g. My Survival Server"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none transition-colors"
                />
              </div>

              {/* Locations Grid Card */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">2. Server Location</h4>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Select a node location closest to your target players</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {locations.map((loc) => {
                    const isSelected = selectedLoc === String(loc.id);
                    return (
                      <div
                        key={loc.id}
                        onClick={() => setSelectedLoc(String(loc.id))}
                        className={`flex flex-col p-4 rounded-xl border transition-all cursor-pointer gap-2.5 ${
                          isSelected
                            ? "bg-white/[0.02] border-white text-white"
                            : "bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:border-zinc-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{loc.flag || "🌐"}</span>
                            <div>
                              <span className="text-xs font-bold block text-white">{loc.name}</span>
                              <span className="text-[9px] font-semibold text-zinc-550 uppercase tracking-wider">
                                {loc.city}, {loc.country}
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-zinc-450 bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-850 font-mono">
                            {loc.ping}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-900 text-[10px] font-semibold">
                          <div>
                            <span className="text-[8px] font-bold text-zinc-550 uppercase tracking-widest block mb-0.5">Available RAM</span>
                            <span className="text-zinc-300 font-mono">
                              {loc.availableRam ? `${(loc.availableRam / 1024).toFixed(1)} GB` : "Unlimited"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-zinc-550 uppercase tracking-widest block mb-0.5">Node Status</span>
                            <span className={loc.isOnline ? "text-emerald-400" : "text-amber-500"}>
                              {loc.isOnline ? "Online" : "Maintenance"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-zinc-550 uppercase tracking-widest block mb-0.5">Free Storage</span>
                            <span className="text-zinc-300 font-mono">
                              {loc.availableDisk ? `${(loc.availableDisk / 1024).toFixed(0)} GB` : "Unlimited"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Software & Version Map Selection Card */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">3. Server software template</h4>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Specify your deployment engine and version tag</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">1. Select Game</label>
                    <select
                      value={selectedGame}
                      onChange={(e) => handleGameChange(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3.5 py-3 text-xs font-bold text-zinc-300 focus:outline-none transition-colors cursor-pointer"
                    >
                      {uniqueGames.map((game) => (
                        <option key={game} value={game}>{game}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">2. Select Software</label>
                    <select
                      value={selectedSoftware}
                      onChange={(e) => handleSoftwareChange(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3.5 py-3 text-xs font-bold text-zinc-300 focus:outline-none transition-colors cursor-pointer"
                    >
                      {filteredSoftwareOptions.map((sw) => (
                        <option key={sw.id} value={sw.id}>{sw.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">3. Version Tag</label>
                    <select
                      value={selectedVersion}
                      onChange={(e) => setSelectedVersion(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3.5 py-3 text-xs font-bold text-zinc-300 focus:outline-none transition-colors cursor-pointer"
                    >
                      {selectedSoftwareDetails?.versions.map((ver) => (
                        <option key={ver} value={ver}>{ver}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Billing Cycle Option Buttons */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">4. Billing Cycle</h4>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Commit longer for higher discount percentages</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {cycles.map((cy) => (
                    <div
                      key={cy.id}
                      onClick={() => setSelectedCycle(cy.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedCycle === cy.id
                          ? "bg-white/[0.02] border-white text-white"
                          : "bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:border-zinc-800"
                      }`}
                    >
                      <span className="text-xs font-bold block">{cy.name}</span>
                      {cy.discount > 0 ? (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1.5 uppercase tracking-wider">
                          -{cy.discount * 100}%
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold text-zinc-550 mt-1.5 uppercase tracking-wider">Base Price</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Addons */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">5. Optional Add-ons</h4>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Customize and scale your hosting environment features</p>
                </div>
                <div className="space-y-3">
                  {addonsList.map((addon) => {
                    const isChecked = activeAddons.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => handleToggleAddon(addon.id)}
                        className={`flex items-start justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? "bg-white/[0.02] border-white text-white"
                            : "bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:border-zinc-800"
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center mt-0.5 transition-all shrink-0 ${
                            isChecked ? "bg-white border-white text-zinc-950" : "border-zinc-700"
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5 font-bold" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold block">{addon.name}</span>
                            <span className="text-[10px] text-zinc-500 font-medium block leading-normal mt-0.5">{addon.description}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold font-mono text-zinc-300 shrink-0 ml-4">
                          +₹{addon.price}/mo
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Step 2 — Order Review Details */
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-8 space-y-6">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">Review Your Configuration</h3>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Please confirm server specifics before order submission</p>
              </div>

              <div className="space-y-4 border-b border-zinc-900 pb-6 text-xs font-medium">
                <div className="flex justify-between items-center py-2 border-b border-zinc-900/40">
                  <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Client Email</span>
                  <span className="text-white font-semibold">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900/40">
                  <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Server Name</span>
                  <span className="text-white font-bold">{serverName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900/40">
                  <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Location Node</span>
                  <span className="text-white font-bold">{selectedLocDetails?.name} ({selectedLocDetails?.city})</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900/40">
                  <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Server Engine</span>
                  <span className="text-white font-bold">{selectedSoftwareDetails?.name} (v{selectedVersion})</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Billing Cycle</span>
                  <span className="text-white font-bold">{selectedCycleDetails?.name} ({selectedCycleDetails?.months} Month(s))</span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 focus:ring-0 text-white mt-0.5 cursor-pointer"
                  />
                  <span className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                    I agree to the <span className="text-white underline font-semibold">Terms of Service</span>, <span className="text-white underline font-semibold">Privacy Policy</span>, and <span className="text-white underline font-semibold">Refund Policy</span>. Billed amounts will renew automatically.
                  </span>
                </label>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2.5 rounded-xl border border-zinc-850 hover:border-zinc-800 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Back to Config
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Sticky Checkout Pricing Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
              <div className="border-b border-zinc-900 pb-4 mb-4">
                <h4 className="text-sm font-bold text-white tracking-tight">Order Summary</h4>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Billing breakdown</p>
              </div>
              <div className="space-y-4 pt-2">
                
                {/* Configuration items summary */}
                <div className="space-y-2.5 text-[11px] text-zinc-500 font-medium border-b border-zinc-900 pb-4">
                  <div className="flex justify-between">
                    <span>{planDetails?.name}</span>
                    <span className="text-white font-bold font-mono">₹{planDetails?.price_numeric}</span>
                  </div>
                  {selectedLocDetails && (
                    <div className="flex justify-between">
                      <span>Node: {selectedLocDetails.name}</span>
                      <span className="text-zinc-400">Included</span>
                    </div>
                  )}
                  {selectedSoftwareDetails && (
                    <div className="flex justify-between">
                      <span>Engine: {selectedSoftwareDetails.name} ({selectedVersion})</span>
                      <span className="text-zinc-400">Included</span>
                    </div>
                  )}
                  {activeAddons.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block">Selected Add-ons:</span>
                      {activeAddons.map(addonId => {
                        const addon = addonsList.find(a => a.id === addonId);
                        return addon ? (
                          <div key={addon.id} className="flex justify-between pl-2 border-l border-zinc-900 text-[10px]">
                            <span>+ {addon.name}</span>
                            <span className="text-zinc-300 font-mono">₹{addon.price}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                {/* Promo Code Input Card */}
                <div className="space-y-2 pt-2 border-b border-zinc-900 pb-4">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Promo / Coupon Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. CYNEX20"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="bg-zinc-900 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg px-2.5 py-1.5 text-[10px] font-semibold focus:outline-none transition-colors w-full uppercase"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMessage && (
                    <span className={`text-[9px] font-bold block mt-1 ${
                      activeCoupon ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {couponMessage}
                    </span>
                  )}
                </div>

                {/* Subtotal / calculations panel */}
                {calc && (
                  <div className="space-y-2 text-xs border-b border-zinc-900 pb-4">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-medium">Billed Months</span>
                      <span className="text-white font-bold">{calc.months} Month(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-medium">Subtotal</span>
                      <span className="text-zinc-300 font-bold font-mono">₹{calc.subtotal.toFixed(2)}</span>
                    </div>
                    {calc.cycleDiscountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-semibold">
                        <span>Cycle Discount</span>
                        <span className="font-mono">-₹{calc.cycleDiscountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {calc.couponDiscountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-semibold">
                        <span>Coupon Discount</span>
                        <span className="font-mono">-₹{calc.couponDiscountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-zinc-400 font-medium">
                      <span>GST Tax (18%)</span>
                      <span className="font-mono">₹{calc.taxAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Final Total */}
                <div className="flex items-end justify-between py-1">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-555 uppercase tracking-widest block">Billed Total</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block font-sans">Due Now</span>
                  </div>
                  <div className="text-right">
                    {loadingCalc ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white ml-auto mb-1" />
                    ) : (
                      <>
                        <span className="text-xl font-bold text-white font-mono block">
                          ₹{calc?.total.toFixed(2) || "0.00"}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mt-0.5">
                          Renewing at ₹{calc?.recurringPrice.toFixed(2)}/mo
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Checkout Trigger Actions */}
                <div className="pt-2 print:hidden">
                  {step === 1 ? (
                    <Button
                      onClick={handleNextStep}
                      disabled={!isConfigComplete}
                      className="w-full bg-white text-zinc-950 hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed font-black py-3 px-6 h-auto text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue to Review</span>
                      <ArrowRight className="w-3.5 h-3.5 font-bold" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCreateCheckoutOrder}
                      disabled={submittingOrder}
                      className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-black py-3 px-6 h-auto text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {submittingOrder ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                          <span>Routing order...</span>
                        </>
                      ) : (
                        <>
                          <Coins className="w-3.5 h-3.5" />
                          <span>Proceed to Payment</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
