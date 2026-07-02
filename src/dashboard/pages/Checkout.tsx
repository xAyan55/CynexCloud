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
    <div className="max-w-6xl mx-auto px-6 py-10 select-none text-zinc-300">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Checkout</h1>
          <p className="text-sm text-zinc-500 mt-1">Configure and review your order</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={step === 1 ? "text-white font-medium" : "text-zinc-500"}>Configure</span>
          <ArrowRight className="w-4 h-4 text-zinc-600" />
          <span className={step === 2 ? "text-white font-medium" : "text-zinc-500"}>Review & Pay</span>
        </div>
      </div>

      {checkoutError && (
        <div className="mb-6 p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{checkoutError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        <div className="lg:col-span-3 space-y-6">
          {step === 1 ? (
            <>
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-5">
                <div className="flex items-center gap-4">
                  {planDetails?.image ? (
                    <img 
                      src={planDetails.image} 
                      alt={planDetails.name} 
                      className="w-12 h-12 object-contain rounded-lg bg-zinc-900 border border-zinc-800 p-1 shrink-0"
                    />
                  ) : (
                    <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800 text-white shrink-0">
                      <Server className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-semibold text-white">{planDetails?.name}</h3>
                    <p className="text-sm text-zinc-500">Base Package</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-zinc-500 shrink-0" />
                    <div>
                      <span className="text-xs text-zinc-500">Memory</span>
                      <p className="text-sm font-medium text-white">{planDetails?.ram}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-4 h-4 text-zinc-500 shrink-0" />
                    <div>
                      <span className="text-xs text-zinc-500">Processor</span>
                      <p className="text-sm font-medium text-white">{planDetails?.cpu || "Epyc vCores"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <HardDrive className="w-4 h-4 text-zinc-500 shrink-0" />
                    <div>
                      <span className="text-xs text-zinc-500">Storage</span>
                      <p className="text-sm font-medium text-white">{planDetails?.storage || planDetails?.disk}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Server Name</h4>
                  <p className="text-sm text-zinc-500 mt-0.5">Choose a name to identify your server</p>
                </div>
                <input
                  type="text"
                  placeholder="e.g. My Survival Server"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Server Location</h4>
                  <p className="text-sm text-zinc-500 mt-0.5">Select the closest node to your players</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {locations.map((loc) => {
                    const isSelected = selectedLoc === String(loc.id);
                    return (
                      <div
                        key={loc.id}
                        onClick={() => setSelectedLoc(String(loc.id))}
                        className={`flex flex-col p-4 rounded-lg border transition-all cursor-pointer gap-3 ${
                          isSelected
                            ? "border-white bg-white/[0.03]"
                            : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${loc.isOnline ? "bg-emerald-500" : "bg-zinc-600"}`} />
                            <div>
                              <span className="text-sm font-medium text-white">{loc.name}</span>
                              <p className="text-xs text-zinc-500">{loc.city}, {loc.country}</p>
                            </div>
                          </div>
                          <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded font-mono">
                            {loc.ping}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-800 text-xs">
                          <div>
                            <span className="text-zinc-500 block mb-0.5">RAM</span>
                            <span className="text-zinc-300 font-medium">
                              {loc.availableRam ? `${(loc.availableRam / 1024).toFixed(1)} GB` : "Unlimited"}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block mb-0.5">Status</span>
                            <span className={loc.isOnline ? "text-emerald-400" : "text-amber-500"}>
                              {loc.isOnline ? "Online" : "Maintenance"}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block mb-0.5">Storage</span>
                            <span className="text-zinc-300 font-medium">
                              {loc.availableDisk ? `${(loc.availableDisk / 1024).toFixed(0)} GB` : "Unlimited"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Software</h4>
                  <p className="text-sm text-zinc-500 mt-0.5">Choose your server software and version</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500">Game</label>
                    <select
                      value={selectedGame}
                      onChange={(e) => handleGameChange(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-zinc-300 focus:outline-none transition-colors cursor-pointer"
                    >
                      {uniqueGames.map((game) => (
                        <option key={game} value={game}>{game}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500">Software</label>
                    <select
                      value={selectedSoftware}
                      onChange={(e) => handleSoftwareChange(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-zinc-300 focus:outline-none transition-colors cursor-pointer"
                    >
                      {filteredSoftwareOptions.map((sw) => (
                        <option key={sw.id} value={sw.id}>{sw.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500">Version</label>
                    <select
                      value={selectedVersion}
                      onChange={(e) => setSelectedVersion(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-zinc-300 focus:outline-none transition-colors cursor-pointer"
                    >
                      {selectedSoftwareDetails?.versions.map((ver) => (
                        <option key={ver} value={ver}>{ver}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Billing Cycle</h4>
                  <p className="text-sm text-zinc-500 mt-0.5">Commit longer for discounts</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {cycles.map((cy) => (
                    <div
                      key={cy.id}
                      onClick={() => setSelectedCycle(cy.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border text-center transition-all cursor-pointer ${
                        selectedCycle === cy.id
                          ? "border-white bg-white/[0.03]"
                          : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700"
                      }`}
                    >
                      <span className="text-sm font-medium text-white">{cy.name}</span>
                      {cy.discount > 0 ? (
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded mt-2">
                          -{cy.discount * 100}%
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500 mt-2">Base Price</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Add-ons</h4>
                  <p className="text-sm text-zinc-500 mt-0.5">Customize your hosting</p>
                </div>
                <div className="space-y-2">
                  {addonsList.map((addon) => {
                    const isChecked = activeAddons.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => handleToggleAddon(addon.id)}
                        className={`flex items-start justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                          isChecked
                            ? "border-white bg-white/[0.03]"
                            : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-all shrink-0 ${
                            isChecked ? "bg-white border-white text-black" : "border-zinc-700"
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-white">{addon.name}</span>
                            <p className="text-xs text-zinc-500 mt-0.5">{addon.description}</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-zinc-300 shrink-0 ml-4">
                          +₹{addon.price}/mo
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Review Your Order</h3>
                <p className="text-sm text-zinc-500 mt-1">Please confirm before submitting</p>
              </div>

              <div className="space-y-4 border-b border-zinc-800 pb-6">
                <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                  <span className="text-sm text-zinc-500">Email</span>
                  <span className="text-sm font-medium text-white">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                  <span className="text-sm text-zinc-500">Server Name</span>
                  <span className="text-sm font-medium text-white">{serverName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                  <span className="text-sm text-zinc-500">Location</span>
                  <span className="text-sm font-medium text-white">{selectedLocDetails?.name} ({selectedLocDetails?.city})</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                  <span className="text-sm text-zinc-500">Software</span>
                  <span className="text-sm font-medium text-white">{selectedSoftwareDetails?.name} v{selectedVersion}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-zinc-500">Billing Cycle</span>
                  <span className="text-sm font-medium text-white">{selectedCycleDetails?.name} ({selectedCycleDetails?.months}m)</span>
                </div>
              </div>

              <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 focus:ring-0 text-white mt-0.5 cursor-pointer"
                  />
                  <span className="text-sm text-zinc-400 leading-relaxed">
                    I agree to the <span className="text-white underline">Terms of Service</span> and <span className="text-white underline">Privacy Policy</span>.
                  </span>
                </label>
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
              <div className="border-b border-zinc-800 pb-4 mb-4">
                <h4 className="text-base font-semibold text-white">Order Summary</h4>
              </div>
              <div className="space-y-4">
                
                <div className="space-y-3 text-sm border-b border-zinc-800 pb-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">{planDetails?.name}</span>
                    <span className="text-white font-medium">₹{planDetails?.price_numeric}</span>
                  </div>
                  {selectedLocDetails && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Location</span>
                      <span className="text-zinc-400">{selectedLocDetails.name}</span>
                    </div>
                  )}
                  {selectedSoftwareDetails && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Software</span>
                      <span className="text-zinc-400">{selectedSoftwareDetails.name}</span>
                    </div>
                  )}
                  {activeAddons.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-xs text-zinc-500 font-medium">Add-ons</span>
                      {activeAddons.map(addonId => {
                        const addon = addonsList.find(a => a.id === addonId);
                        return addon ? (
                          <div key={addon.id} className="flex justify-between text-sm pl-3 border-l border-zinc-800">
                            <span className="text-zinc-400">{addon.name}</span>
                            <span className="text-zinc-300">₹{addon.price}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2 border-b border-zinc-800 pb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors w-full uppercase"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      variant="secondary"
                      size="sm"
                    >
                      Apply
                    </Button>
                  </div>
                  {couponMessage && (
                    <span className={`text-xs block ${
                      activeCoupon ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {couponMessage}
                    </span>
                  )}
                </div>

                {calc && (
                  <div className="space-y-2 text-sm border-b border-zinc-800 pb-4">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Months</span>
                      <span className="text-white font-medium">{calc.months}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Subtotal</span>
                      <span className="text-zinc-300 font-medium">₹{calc.subtotal.toFixed(2)}</span>
                    </div>
                    {calc.cycleDiscountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Cycle Discount</span>
                        <span>-₹{calc.cycleDiscountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {calc.couponDiscountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Coupon Discount</span>
                        <span>-₹{calc.couponDiscountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-zinc-400">
                      <span>Tax (18%)</span>
                      <span>₹{calc.taxAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-end justify-between pt-1">
                  <div>
                    <p className="text-xs text-zinc-500">Total Due</p>
                  </div>
                  <div className="text-right">
                    {loadingCalc ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white ml-auto" />
                    ) : (
                      <>
                        <p className="text-xl font-semibold text-white">
                          ₹{calc?.total.toFixed(2) || "0.00"}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          then ₹{calc?.recurringPrice.toFixed(2)}/mo
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  {step === 1 ? (
                    <Button
                      onClick={handleNextStep}
                      disabled={!isConfigComplete}
                      className="w-full"
                    >
                      Continue to Review
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCreateCheckoutOrder}
                      disabled={submittingOrder}
                      className="w-full"
                    >
                      {submittingOrder ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Coins className="w-4 h-4" />
                          Pay Now
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
