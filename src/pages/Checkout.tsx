import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, ChevronLeft, CreditCard, Package } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { MINECRAFT_PRICING } from "@/constants"
import { cn } from "@/lib/utils"

interface Plan {
  id: string; name: string; price: string; ram?: string; cpu?: string; storage?: string
  features: string[]; description?: string; popular?: boolean
}

export default function Checkout() {
  const { planId } = useParams()
  const { user, authFetch } = useAuth()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [interval, setInterval] = useState("monthly")
  const [coupon, setCoupon] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetch("/api/plans")
      .then(res => res.json())
      .then((data: Plan[]) => {
        const found = data.find((p: Plan) => p.id === planId) || MINECRAFT_PRICING.find(p => p.id === planId)
        setPlan(found || null)
      })
      .catch(() => {
        const found = MINECRAFT_PRICING.find(p => p.id === planId)
        setPlan(found || null)
      })
      .finally(() => setLoading(false))
  }, [planId])

  const handlePayment = async () => {
    if (!plan || !user) return
    setProcessing(true)
    try {
      const res = await authFetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, interval })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error("Checkout error:", err)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3 space-y-4"><Skeleton className="h-40" /><Skeleton className="h-40" /></div>
            <div className="md:col-span-2"><Skeleton className="h-60" /></div>
          </div>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto max-w-md px-6">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-heading mb-2">Plan Not Found</h1>
          <p className="text-muted-foreground mb-6">The plan you're looking for doesn't exist.</p>
          <Link to="/minecraft"><Button>View Plans</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <Link to="/minecraft" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ChevronLeft className="w-4 h-4" /> Back to plans
        </Link>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Billing Interval</Label>
                  <Select value={interval} onValueChange={setInterval}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly (Save 10%)</SelectItem>
                      <SelectItem value="yearly">Yearly (Save 20%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Coupon Code</Label>
                  <div className="flex gap-2 mt-1">
                    <Input placeholder="Enter coupon" value={coupon} onChange={e => setCoupon(e.target.value)} />
                    <Button variant="outline">Apply</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Payment Method</CardTitle>
                <CardDescription>You'll be redirected to complete payment after placing the order.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card/50">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Pay with Card / PayPal</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="border-border sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  {plan.features?.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-foreground shrink-0" />{f}
                    </div>
                  ))}
                  {plan.ram && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="w-3.5 h-3.5 text-foreground shrink-0" />{plan.ram} RAM</div>}
                  {plan.storage && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="w-3.5 h-3.5 text-foreground shrink-0" />{plan.storage}</div>}
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-xl font-bold text-foreground">₹{plan.price}<span className="text-sm font-normal text-muted-foreground">/{interval === "yearly" ? "yr" : "mo"}</span></span>
                </div>

                {!user ? (
                  <div className="text-sm text-muted-foreground text-center p-3 rounded-lg bg-accent/50">
                    Please <Link to="/auth" className="text-foreground hover:underline">sign in</Link> to continue.
                  </div>
                ) : (
                  <Button className="w-full" onClick={handlePayment} disabled={processing}>
                    {processing ? "Processing..." : `Pay ₹${plan.price}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
