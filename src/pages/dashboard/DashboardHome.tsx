import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/useAuth"
import { Server, FileText, Ticket, ArrowRight, Terminal, Plus, Shield, Network, Zap, Cpu, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { io } from "socket.io-client"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts"

interface Service {
  id: string;
  name: string;
  status: string;
  planId?: string;
  ram?: string;
  location?: string;
}

export default function DashboardHome() {
  const { user, authFetch } = useAuth()
  const [stats, setStats] = useState({ services: 0, invoices: 0, tickets: 0 })
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])

  // Fetch stats and services
  useEffect(() => {
    Promise.all([
      authFetch("/api/services").then(r => r.json()).then(d => {
        const list = Array.isArray(d) ? d : []
        setServices(list)
        setStats(s => ({ ...s, services: list.length }))
      }).catch(() => {}),
      authFetch("/api/invoices").then(r => r.json()).then(d => {
        setStats(s => ({ ...s, invoices: Array.isArray(d) ? d.filter((i: any) => i.status === "unpaid").length : 0 }))
      }).catch(() => {}),
      authFetch("/api/tickets").then(r => r.json()).then(d => {
        setStats(s => ({ ...s, tickets: Array.isArray(d) ? d.filter((t: any) => t.status === "open").length : 0 }))
      }).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  // Socket.io for Real-time System Metrics
  useEffect(() => {
    const socket = io(window.location.origin)
    
    socket.on("system_health", (data) => {
      setChartData(prev => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          cpu: data.cpu,
          ram: data.ram,
          network: data.network
        }]
        if (newData.length > 10) newData.shift()
        return newData
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const activeServices = services.filter(s => s.status.toLowerCase() === "active" || s.status.toLowerCase() === "running")

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#f0f0f0]">Client Dashboard</h1>
            <Badge variant="outline" className="border-border/60 text-[10px] text-muted-foreground gap-1.5 py-0.5">
              <Sparkles className="w-3 h-3 text-amber-500" /> Professional Node Tier
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Logged in as <span className="text-foreground font-medium">{user?.username}</span>. Account status operational.
          </p>
        </div>
        <Link to="/dashboard/deploy">
          <Button size="sm" className="h-8 font-medium">
            <Plus className="w-4 h-4 mr-1.5" /> Deploy New Instance
          </Button>
        </Link>
      </div>

      {/* Quick Status Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-border bg-card/30 hover:bg-card/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Active Services</span>
            <Server className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">{stats.services}</div>
            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> All instances operational
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/30 hover:bg-card/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Unpaid Invoices</span>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">{stats.invoices}</div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {stats.invoices > 0 ? `${stats.invoices} invoice(s) pending payment` : "No pending balance"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/30 hover:bg-card/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Open Tickets</span>
            <Ticket className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">{stats.tickets}</div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {stats.tickets > 0 ? "Support response pending" : "No active requests"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Contents Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Active Instances & Actions */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Instances List */}
          <Card className="border-border bg-card/20">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-semibold tracking-tight text-[#f0f0f0]">Your Servers</CardTitle>
              <CardDescription className="text-xs">Select a server to view analytics and controls.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : services.length === 0 ? (
                <div className="p-8 text-center space-y-4">
                  <Server className="w-8 h-8 mx-auto text-muted-foreground/60" />
                  <p className="text-xs text-muted-foreground">No server instances running on your account.</p>
                  <Link to="/dashboard/deploy">
                    <Button size="sm" variant="outline" className="h-7 text-[10px]">
                      Deploy first server
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {services.map((srv) => (
                    <div key={srv.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-zinc-900 border border-border/60 flex items-center justify-center">
                          <Server className="w-4 h-4 text-foreground" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-[#f0f0f0]">{srv.name}</h4>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            {srv.planId || "Default Plan"} • {srv.location || "Frankfurt, DE"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 border-emerald-500/20 bg-emerald-950/15 text-emerald-400 capitalize">
                          {srv.status}
                        </Badge>
                        <Link to={`/dashboard/services/${srv.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border bg-card/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">System Operations</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link to="/dashboard/services" className="w-full">
                <Button variant="outline" className="w-full text-xs h-9 justify-start bg-zinc-950/40">
                  <Server className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> Server List
                </Button>
              </Link>
              <Link to="/dashboard/deploy" className="w-full">
                <Button variant="outline" className="w-full text-xs h-9 justify-start bg-zinc-950/40">
                  <Plus className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> Deploy VPS
                </Button>
              </Link>
              <Link to="/dashboard/invoices" className="w-full">
                <Button variant="outline" className="w-full text-xs h-9 justify-start bg-zinc-950/40">
                  <FileText className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> Billing log
                </Button>
              </Link>
              <Link to="/dashboard/support" className="w-full">
                <Button variant="outline" className="w-full text-xs h-9 justify-start bg-zinc-950/40">
                  <Ticket className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> Support tickets
                </Button>
              </Link>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Platform Resource Live Monitoring */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border bg-card/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold tracking-tight text-[#f0f0f0]">Platform Health</CardTitle>
                  <CardDescription className="text-xs">Real-time resource performance metrics of active hypervisors.</CardDescription>
                </div>
                <Badge variant="outline" className="border-emerald-500/20 bg-emerald-950/15 text-[9px] text-emerald-400 gap-1 py-0.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" /> Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Recharts Area Graph */}
              <div className="h-[180px] w-full text-[10px] font-mono">
                {chartData.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center border border-dashed border-border/60 rounded">
                    <p className="text-muted-foreground text-xs">Awaiting console handshake...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#555" fontSize={8} />
                      <YAxis stroke="#555" fontSize={8} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f0f0f", borderColor: "#2a2a2a", fontSize: 10, color: "#fff" }} />
                      <Area type="monotone" dataKey="cpu" name="CPU Load (%)" stroke="#a3a3a3" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Status Specs */}
              <div className="grid grid-cols-3 gap-4 border-t border-border/40 pt-4 text-center">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Global Latency</span>
                  <span className="text-xs font-semibold text-[#f0f0f0] font-mono">14ms</span>
                </div>
                <div className="space-y-1 border-x border-border/40">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Anycast Nodes</span>
                  <span className="text-xs font-semibold text-[#f0f0f0] font-mono">12 Active</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">DDoS Status</span>
                  <span className="text-xs font-semibold text-emerald-400 font-mono">Protected</span>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
