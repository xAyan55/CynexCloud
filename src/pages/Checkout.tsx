import { useState, useEffect, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Check, ChevronLeft, Globe, Server, Cpu, HardDrive, AlertCircle, ExternalLink, Wifi } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface Plan {
  id: string; name: string; price: string; price_numeric?: number
  ram?: string; cpu?: string; storage?: string; disk?: string
  features: string[]; description?: string; popular?: boolean
  image?: string; ram_mb?: number; cpu_pct?: number; disk_mb?: number
}

interface Location {
  id: string | number; name: string; country: string; city?: string
  ping?: string; flag?: string; isOnline?: boolean
  availableRam?: number; availableDisk?: number
}

interface Software {
  id: string; name: string; versions: string[]
  eggId?: number; nestId?: number
}

interface Cycle {
  id: string; name: string; months: number; discount: number
}

interface Addon {
  id: string; name: string; price?: number; price_pct?: number; description?: string
}

export default function Checkout() {
  const { planId } = useParams()
  const { user, authFetch } = useAuth()

  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [configLoading, setConfigLoading] = useState(true)
  const [configError, setConfigError] = useState("")

  const [serverName, setServerName] = useState("")
  const [locationId, setLocationId] = useState("")
  const [softwareId, setSoftwareId] = useState("")
  const [version, setVersion] = useState("")
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [coupon, setCoupon] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  const [locations, setLocations] = useState<Location[]>([])
  const [softwareList, setSoftwareList] = useState<Software[]>([])
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [addons, setAddons] = useState<Addon[]>([])

  useEffect(() => {
    fetch("/api/plans")
      .then(res => res.json())
      .then((data: Plan[]) => {
        const found = data.find(p => p.id === planId)
        setPlan(found || null)
      })
      .catch(() => setPlan(null))
      .finally(() => setLoading(false))
  }, [planId])

  useEffect(() => {
    fetch("/api/checkout/config")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLocations(data.locations || [])
          setSoftwareList(data.software || [])
          setCycles(data.cycles || [])
          setAddons(data.addons || [])
        } else {
          setConfigError("Failed to load checkout configuration")
        }
      })
      .catch(() => setConfigError("Failed to load checkout configuration"))
      .finally(() => setConfigLoading(false))
  }, [])

  const selectedSoftware = useMemo(() =>
    softwareList.find(s => s.id === softwareId), [softwareId, softwareList]
  )

  const versions = selectedSoftware?.versions || []

  useEffect(() => {
    if (versions.length > 0 && !versions.includes(version)) {
      setVersion(versions[0])
    }
  }, [softwareId, versions, version])

  const selectedCycle = useMemo(() =>
    cycles.find(c => c.id === billingCycle), [billingCycle, cycles]
  )

  const basePrice = plan?.price_numeric || parseFloat(plan?.price?.replace(/[^0-9.]/g, "") || "0")
  const months = selectedCycle?.months || 1
  const subTotal = basePrice * months

  const calcAddonPrice = (addon: Addon) =>
    addon.price_pct ? Math.round(basePrice * addon.price_pct / 100) : (addon.price || 0)

  const addonsTotal = useMemo(() => {
    let total = 0
    selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId)
      if (addon) total += calcAddonPrice(addon) * months
    })
    return total
  }, [selectedAddons, addons, months, basePrice])

  const cycleDiscountRate = selectedCycle?.discount || 0
  const cycleDiscount = subTotal * cycleDiscountRate

  let couponDiscountPct = 0
  const normalizedCoupon = coupon.toUpperCase().trim()
  if (normalizedCoupon === "CYNEX20") couponDiscountPct = 0.20
  else if (normalizedCoupon === "START10") couponDiscountPct = 0.10

  const afterCycleDiscount = subTotal + addonsTotal - cycleDiscount
  const couponDiscount = afterCycleDiscount * couponDiscountPct
  const totalDiscount = cycleDiscount + couponDiscount
  const taxableAmount = Math.max(0, subTotal + addonsTotal - totalDiscount)
  const taxAmount = Math.round(taxableAmount * 0.18 * 100) / 100
  const total = Math.round((taxableAmount + taxAmount) * 100) / 100

  const handlePay = async () => {
    if (!user || !plan || !serverName.trim() || !locationId || !softwareId || !version || !agreeTerms) return

    setProcessing(true)
    setError("")

    try {
      const orderRes = await authFetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          serverName: serverName.trim(),
          billingCycle,
          locationId,
          softwareId,
          version,
          selectedAddons,
          coupon: coupon.trim() || undefined,
        }),
      })

      const orderData = await orderRes.json()
      if (!orderData.success) {
        setError(orderData.error || "Failed to create order")
        setProcessing(false)
        return
      }

      const payRes = await authFetch("/api/payments/oxapay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: orderData.invoiceId }),
      })

      const payData = await payRes.json()
      if (!payData.success) {
        setError(payData.error || "Failed to initiate payment")
        setProcessing(false)
        return
      }

      window.location.href = payData.payUrl
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
      setProcessing(false)
    }
  }

  if (loading || configLoading) {
    return (
      <div className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid lg:grid-cols-7 gap-8">
            <div className="lg:col-span-4 space-y-4"><Skeleton className="h-64" /><Skeleton className="h-48" /></div>
            <div className="lg:col-span-3"><Skeleton className="h-96" /></div>
          </div>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto max-w-md px-6">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-heading mb-2">Plan Not Found</h1>
          <p className="text-muted-foreground mb-6">The plan you're looking for doesn't exist.</p>
          <Link to="/minecraft"><Button>View Plans</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Link to="/minecraft" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to plans
        </Link>

        <div className="grid lg:grid-cols-7 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Server Configuration</CardTitle>
                <CardDescription>Configure your new server</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label htmlFor="server-name">Server Name</Label>
                  <Input
                    id="server-name"
                    placeholder="My Awesome Server"
                    value={serverName}
                    onChange={e => setServerName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Location / Node</Label>
                  {configError ? (
                    <p className="text-xs text-destructive mt-1">{configError}</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 mt-1">
                      {locations.filter(l => l.isOnline !== false).map(loc => (
                        <label
                          key={loc.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            String(locationId) === String(loc.id)
                              ? "border-primary bg-primary/10"
                              : "border-border hover:bg-accent/30"
                          }`}
                          onClick={() => setLocationId(String(loc.id))}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            String(locationId) === String(loc.id) ? "border-primary" : "border-zinc-600"
                          }`}>
                            {String(locationId) === String(loc.id) && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <Wifi className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {loc.flag && <span className="text-sm">{loc.flag}</span>}
                              <span className="text-sm font-medium">{loc.name}</span>
                              {loc.country && <span className="text-xs text-muted-foreground">— {loc.country}</span>}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              {loc.ping && <span>{loc.ping} ping</span>}
                              {loc.availableRam !== undefined && <span>{Math.round(loc.availableRam / 1024)}GB RAM free</span>}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Server Software</Label>
                  <Select value={softwareId} onValueChange={v => { setSoftwareId(v); setVersion("") }} disabled={configError !== ""}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Select software..." />
                    </SelectTrigger>
                    <SelectContent className="min-w-[200px]">
                      {softwareList.map(sw => (
                        <SelectItem key={sw.id} value={sw.id}>{sw.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {softwareId && (
                  <div>
                    <Label>Version</Label>
                    <Select value={version} onValueChange={setVersion}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select version..." />
                      </SelectTrigger>
                      <SelectContent>
                        {versions.map(v => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Billing & Add-ons</CardTitle>
                <CardDescription>Choose your billing cycle and optional extras</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label>Billing Cycle</Label>
                  <Select value={billingCycle} onValueChange={setBillingCycle}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cycles.map(cycle => (
                        <SelectItem key={cycle.id} value={cycle.id}>
                          {cycle.name}{cycle.discount > 0 ? ` (Save ${Math.round(cycle.discount * 100)}%)` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {addons.length > 0 && (
                  <div className="space-y-3">
                    <Label>Add-ons</Label>
                    {addons.map(addon => {
                      const addonPrice = calcAddonPrice(addon)
                      return (
                        <label
                          key={addon.id}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-accent/30 transition-colors"
                        >
                          <Checkbox
                            checked={selectedAddons.includes(addon.id)}
                            onCheckedChange={checked => {
                              setSelectedAddons(prev =>
                                checked ? [...prev, addon.id] : prev.filter(id => id !== addon.id)
                              )
                            }}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{addon.name}</p>
                            {addon.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{addon.description}</p>
                            )}
                          </div>
                          <p className="text-sm font-medium whitespace-nowrap">+₹{addonPrice}<span className="text-xs text-muted-foreground font-normal">/mo</span></p>
                        </label>
                      )
                    })}
                  </div>
                )}

                <div>
                  <Label>Coupon Code</Label>
                  <div className="flex gap-2 mt-1">
                    <Input placeholder="Enter coupon" value={coupon} onChange={e => setCoupon(e.target.value)} />
                  </div>
                  {couponDiscountPct > 0 && (
                    <p className="text-xs text-green-500 mt-1">Coupon applied: {Math.round(couponDiscountPct * 100)}% off</p>
                  )}
                  {coupon.trim() && couponDiscountPct === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Invalid or expired coupon</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="border-border sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.image && (
                  <div className="rounded-lg overflow-hidden bg-accent/30 -mx-6 -mt-4 mb-2">
                    <img
                      src={plan.image}
                      alt={plan.name}
                      className="w-full h-36 object-contain"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{plan.name}</p>
                    {plan.description && <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>}
                  </div>
                </div>

                {serverName && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Server className="w-3 h-3" /> {serverName}
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  {plan.ram && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Cpu className="w-3.5 h-3.5 shrink-0" /> {plan.ram}
                    </div>
                  )}
                  {plan.cpu && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Cpu className="w-3.5 h-3.5 shrink-0" /> {plan.cpu}
                    </div>
                  )}
                  {(plan.storage || plan.disk) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HardDrive className="w-3.5 h-3.5 shrink-0" /> {plan.storage || plan.disk}
                    </div>
                  )}
                  {plan.features?.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-3.5 h-3.5 shrink-0" /> {f}
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Base Price</span><span>₹{basePrice}/mo</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Billing Cycle</span><span>{selectedCycle?.name || billingCycle}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({months}mo)</span><span>₹{subTotal}</span></div>
                  {addonsTotal > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Add-ons</span><span>+₹{addonsTotal}</span></div>}
                  {cycleDiscount > 0 && <div className="flex justify-between text-green-500"><span>Cycle Discount</span><span>-₹{cycleDiscount}</span></div>}
                  {couponDiscount > 0 && <div className="flex justify-between text-green-500"><span>Coupon ({Math.round(couponDiscountPct * 100)}%)</span><span>-₹{couponDiscount}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax (18%)</span><span>₹{taxAmount}</span></div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-xl font-bold">₹{total}<span className="text-sm font-normal text-muted-foreground"> for {months}mo</span></span>
                </div>

                <label className="flex items-start gap-3 cursor-pointer pt-1">
                  <Checkbox checked={agreeTerms} onCheckedChange={c => setAgreeTerms(c as boolean)} className="mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <Link to="/terms" className="text-foreground hover:underline">Terms of Service</Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-foreground hover:underline">Privacy Policy</Link>
                  </p>
                </label>

                {error && (
                  <div className="text-sm text-destructive text-center p-2 rounded bg-destructive/10">{error}</div>
                )}

                {!user ? (
                  <div className="text-sm text-muted-foreground text-center p-3 rounded-lg bg-accent/50">
                    Please <Link to="/login" className="text-foreground hover:underline">sign in</Link> to continue.
                  </div>
                ) : (
                  <Button
                    className="w-full gap-2"
                    onClick={handlePay}
                    disabled={processing || !serverName.trim() || !locationId || !softwareId || !version || !agreeTerms}
                  >
                    {processing ? (
                      <>Processing...</>
                    ) : (
                      <><ExternalLink className="w-4 h-4" /> Pay ₹{total} with Crypto (OxaPay)</>
                    )}
                  </Button>
                )}

                <p className="text-[10px] text-center text-muted-foreground">
                  Secured by <span className="text-foreground font-medium">OxaPay</span> — Bitcoin, USDT, ETH, LTC and 150+ cryptocurrencies accepted
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
