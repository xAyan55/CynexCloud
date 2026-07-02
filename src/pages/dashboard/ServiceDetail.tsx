import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, Server, Power, RotateCcw, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function ServiceDetail() {
  const { id } = useParams()
  const { authFetch } = useAuth()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch(`/api/services/${id}`)
      .then(r => r.json())
      .then(setService)
      .catch(() => setService(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div>
  if (!service) return <div className="text-center py-16"><p className="text-muted-foreground">Service not found.</p><Link to="/dashboard/services"><Button variant="outline" className="mt-4">Back</Button></Link></div>

  return (
    <div>
      <Link to="/dashboard/services" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Services
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">{service.name}</h1>
          <Badge variant="default" className="mt-2">{service.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><RotateCcw className="w-4 h-4 mr-1" /> Restart</Button>
          <Button variant="outline" size="sm"><Power className="w-4 h-4 mr-1" /> Stop</Button>
          <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Resource Usage</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><div className="flex justify-between text-sm mb-1"><span>RAM</span><span className="text-muted-foreground">{service.ram || "0MB"} / {service.limit?.ram || "0MB"}</span></div><Progress value={service.usage?.ram || 0} className="h-2" /></div>
            <div><div className="flex justify-between text-sm mb-1"><span>CPU</span><span className="text-muted-foreground">{service.usage?.cpu || 0}%</span></div><Progress value={service.usage?.cpu || 0} className="h-2" /></div>
            <div><div className="flex justify-between text-sm mb-1"><span>Disk</span><span className="text-muted-foreground">{service.disk || "0MB"} / {service.limit?.disk || "0MB"}</span></div><Progress value={service.usage?.disk || 0} className="h-2" /></div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="text-foreground">{service.plan || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Node</span><span className="text-foreground">{service.node || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">IP Address</span><span className="text-foreground">{service.ip || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Port</span><span className="text-foreground">{service.port || "-"}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
