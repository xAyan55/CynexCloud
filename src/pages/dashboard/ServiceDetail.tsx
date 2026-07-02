import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ExternalLink } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function ServiceDetail() {
  const { id } = useParams()
  const { authFetch } = useAuth()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch(`/api/services/${id}`)
      .then(r => r.json())
      .then(data => { if (data.success) setService(data.service) })
      .catch(() => setService(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-40" /></div>
  if (!service) return <div className="text-center py-16"><p className="text-muted-foreground">Service not found.</p><Link to="/dashboard/services"><Button variant="outline" className="mt-4">Back</Button></Link></div>

  const statusColor = (s: string) => {
    if (s === "Active") return "default" as const
    if (s === "Pending Payment") return "secondary" as const
    if (s === "Queued" || s === "Provisioning") return "outline" as const
    return "destructive" as const
  }

  return (
    <div>
      <Link to="/dashboard/services" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Services
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">{service.name}</h1>
          <Badge variant={statusColor(service.status)} className="mt-2">{service.status}</Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="text-foreground">{service.planId || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Billing Cycle</span><span className="text-foreground">{service.billingCycle || "Monthly"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span className="text-foreground">{service.price ? `$${service.price}` : "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span className="text-foreground">{service.createdAt ? new Date(service.createdAt).toLocaleDateString() : "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Next Renewal</span><span className="text-foreground">{service.nextRenewalDate ? new Date(service.nextRenewalDate).toLocaleDateString() : "-"}</span></div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Server Info</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Node</span><span className="text-foreground">{service.location || service.node || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="text-foreground">{service.id}</span></div>
            {service.pterodactylId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Panel</span>
                <span className="text-foreground">Pterodactyl #{service.pterodactylId}</span>
              </div>
            )}
            {service.pterodactylId && (
              <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <a href={`/panel`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" /> Manage in Panel
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
