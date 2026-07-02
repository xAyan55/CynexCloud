import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { Server, FileText, Ticket, Activity, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export default function DashboardHome() {
  const { user, authFetch } = useAuth()
  const [stats, setStats] = useState({ services: 0, invoices: 0, tickets: 0 })

  useEffect(() => {
    Promise.all([
      authFetch("/api/services").then(r => r.json()).then(d => setStats(s => ({ ...s, services: Array.isArray(d) ? d.length : 0 }))).catch(() => {}),
      authFetch("/api/invoices").then(r => r.json()).then(d => setStats(s => ({ ...s, invoices: Array.isArray(d) ? d.length : 0 }))).catch(() => {}),
      authFetch("/api/tickets").then(r => r.json()).then(d => setStats(s => ({ ...s, tickets: Array.isArray(d) ? d.length : 0 }))).catch(() => {}),
    ])
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading tracking-tight">Welcome back, {user?.username}</h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your account.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Services</CardTitle>
              <CardDescription className="text-2xl font-bold text-foreground mt-1">{stats.services}</CardDescription>
            </div>
            <Server className="w-8 h-8 text-muted-foreground" />
          </CardHeader>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Invoices</CardTitle>
              <CardDescription className="text-2xl font-bold text-foreground mt-1">{stats.invoices}</CardDescription>
            </div>
            <FileText className="w-8 h-8 text-muted-foreground" />
          </CardHeader>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Support Tickets</CardTitle>
              <CardDescription className="text-2xl font-bold text-foreground mt-1">{stats.tickets}</CardDescription>
            </div>
            <Ticket className="w-8 h-8 text-muted-foreground" />
          </CardHeader>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link to="/dashboard/services"><Button variant="outline" size="sm">View Services <ArrowRight className="w-3 h-3 ml-1" /></Button></Link>
          <Link to="/dashboard/deploy"><Button variant="outline" size="sm">Deploy Server <ArrowRight className="w-3 h-3 ml-1" /></Button></Link>
          <Link to="/dashboard/invoices"><Button variant="outline" size="sm">View Invoices <ArrowRight className="w-3 h-3 ml-1" /></Button></Link>
          <Link to="/dashboard/support"><Button variant="outline" size="sm">Support <ArrowRight className="w-3 h-3 ml-1" /></Button></Link>
        </CardContent>
      </Card>
    </div>
  )
}
