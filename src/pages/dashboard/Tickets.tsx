import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ticket, Plus, Eye, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function Tickets() {
  const { authFetch } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch("/api/tickets")
      .then(r => r.json())
      .then(data => { if (data.success) setTickets(data.tickets || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statusColor = (s: string) => {
    if (s === "open") return "default" as const
    if (s === "answered") return "secondary" as const
    return "outline" as const
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading tracking-tight">Support Tickets</h1>
        <Link to="/dashboard/support/create"><Button size="sm"><Plus className="w-4 h-4 mr-1" />New Ticket</Button></Link>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : tickets.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16">
            <Ticket className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-2">No tickets</p>
            <p className="text-muted-foreground text-sm mb-6">Create a support ticket if you need help.</p>
            <Link to="/dashboard/support/create"><Button>Create Ticket</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <Table>
            <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead>Last Updated</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {tickets.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.subject}</TableCell>
                  <TableCell><Badge variant={statusColor(t.status)}>{t.status}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{t.priority}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : "-"}</TableCell>
                  <TableCell><Link to={`/dashboard/support/${t.id}`}><Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button></Link></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
