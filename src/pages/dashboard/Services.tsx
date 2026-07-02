import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Server, Eye } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface Service {
  id: string; name: string; status: string; plan?: string; ram?: string; cpu?: string; disk?: string; nextDueDate?: string
}

export default function Services() {
  const { authFetch } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch("/api/services")
      .then(r => r.json())
      .then(data => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false))
  }, [])

  const statusVariant = (s: string) => {
    if (s === "active" || s === "running") return "default" as const
    if (s === "suspended") return "outline" as const
    return "secondary" as const
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading tracking-tight">Services</h1>
        <Link to="/dashboard/deploy"><Button size="sm">Deploy New</Button></Link>
      </div>

      {services.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Server className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">No services yet</p>
            <p className="text-sm text-muted-foreground mb-6">Deploy your first server to get started.</p>
            <Link to="/dashboard/deploy"><Button>Deploy Server</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Plan</TableHead><TableHead>RAM</TableHead><TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-foreground">{s.name}</TableCell>
                  <TableCell><Badge variant={statusVariant(s.status)}>{s.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{s.plan || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{s.ram || "-"}</TableCell>
                  <TableCell>
                    <Link to={`/dashboard/services/${s.id}`}>
                      <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
