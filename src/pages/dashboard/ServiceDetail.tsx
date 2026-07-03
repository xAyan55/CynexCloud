import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ExternalLink, Play, Square, RotateCcw, Loader2, Cpu, HardDrive, Activity } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function ServiceDetail() {
  const { id } = useParams()
  const { authFetch } = useAuth()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [powerLoading, setPowerLoading] = useState<string | null>(null)
  const [instance, setInstance] = useState<any>(null)
  const [instanceLoading, setInstanceLoading] = useState(false)
  const [cynexvmUrl, setCynexvmUrl] = useState("")

  const loadService = () => {
    authFetch(`/api/services/${id}`)
      .then(r => r.json())
      .then(data => { if (data.success) setService(data.service) })
      .catch(() => setService(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadService() }, [id])

  useEffect(() => {
    if (service?.cynexvmId) {
      setInstanceLoading(true)
      authFetch("/api/cynexvm/config")
        .then(r => r.json())
        .then(data => { if (data.success) setCynexvmUrl(data.url) })
        .catch(() => {})
      authFetch(`/api/cynexvm/instances/${service.cynexvmId}`)
        .then(r => r.json())
        .then(data => { if (data.success) setInstance(data.instance) })
        .catch(() => setInstance(null))
        .finally(() => setInstanceLoading(false))
    }
  }, [service?.cynexvmId])

  const powerAction = async (action: "start" | "stop" | "restart") => {
    if (!service?.cynexvmId) return
    setPowerLoading(action)
    try {
      await authFetch(`/api/cynexvm/instances/${service.cynexvmId}/${action}`, { method: "POST" })
      setTimeout(() => {
        authFetch(`/api/cynexvm/instances/${service.cynexvmId}`)
          .then(r => r.json())
          .then(data => { if (data.success) setInstance(data.instance) })
          .catch(() => {})
          .finally(() => setPowerLoading(null))
      }, 2000)
    } catch {
      setPowerLoading(null)
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-40" /></div>
  if (!service) return <div className="text-center py-16"><p className="text-muted-foreground">Service not found.</p><Link to="/dashboard/services"><Button variant="outline" className="mt-4">Back</Button></Link></div>

  const statusColor = (s: string) => {
    if (s === "Active" || s === "running") return "default" as const
    if (s === "Pending Payment") return "secondary" as const
    if (s === "Queued" || s === "Provisioning") return "outline" as const
    if (s === "stopped") return "secondary" as const
    return "destructive" as const
  }

  const instanceStatus = instance?.status || ""
  const live = instance?.live || instance?.resources || {}

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
            {service.osTemplate && <div className="flex justify-between"><span className="text-muted-foreground">OS</span><span className="text-foreground">{service.osTemplate}</span></div>}
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
            {service.cynexvmId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">VM ID</span>
                <span className="text-foreground">#{service.cynexvmId}</span>
              </div>
            )}
            {service.cynexvmId && cynexvmUrl && (
              <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <a href={cynexvmUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" /> Manage in CynexVM
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {service.cynexvmId && (
        <>
          <Card className="border-border mt-6">
            <CardHeader><CardTitle className="text-base">Power Controls</CardTitle></CardHeader>
            <CardContent className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => powerAction("start")}
                disabled={powerLoading !== null || instanceStatus === "running"}
              >
                {powerLoading === "start" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
                Start
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => powerAction("stop")}
                disabled={powerLoading !== null || instanceStatus !== "running"}
              >
                {powerLoading === "stop" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Square className="w-4 h-4 mr-1" />}
                Stop
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => powerAction("restart")}
                disabled={powerLoading !== null || instanceStatus !== "running"}
              >
                {powerLoading === "restart" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-1" />}
                Restart
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border mt-6">
            <CardHeader><CardTitle className="text-base">Resource Usage</CardTitle></CardHeader>
            <CardContent>
              {instanceLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : instance ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-accent/30">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Cpu className="w-4 h-4" /> CPU</div>
                    <p className="text-lg font-semibold">{live.cpu !== undefined ? `${(live.cpu * 100).toFixed(1)}%` : "-"}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/30">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Activity className="w-4 h-4" /> Memory</div>
                    <p className="text-lg font-semibold">{live.mem !== undefined ? `${(live.mem / 1024 / 1024).toFixed(0)}MB` : "-"}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/30">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><HardDrive className="w-4 h-4" /> Disk</div>
                    <p className="text-lg font-semibold">{live.disk !== undefined ? `${(live.disk / 1024 / 1024 / 1024).toFixed(1)}GB` : "-"}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/30">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Activity className="w-4 h-4" /> Status</div>
                    <p className="text-lg font-semibold capitalize">{instanceStatus || "-"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Unable to fetch resource data.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
