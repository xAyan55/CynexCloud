import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function AdminTickets() {
  const { authFetch } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch("/api/admin/tickets")
      .then(r => r.json())
      .then(data => { if (data.success) setTickets(data.tickets) })
      .catch(() => toast.error("Failed to load tickets"))
      .finally(() => setLoading(false))
  }, [])

  const statusColor = (s: string) => {
    if (s === "open") return "default" as const
    if (s === "answered") return "secondary" as const
    return "outline" as const
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">All Tickets</h1>
      <Card className="border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
            ) : tickets.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No support tickets</TableCell></TableRow>
            ) : tickets.map(t => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.subject}</TableCell>
                <TableCell className="text-muted-foreground">{t.username || t.email}</TableCell>
                <TableCell><Badge variant={statusColor(t.status)}>{t.status}</Badge></TableCell>
                <TableCell><Badge variant="outline">{t.priority}</Badge></TableCell>
                <TableCell className="text-muted-foreground text-sm">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "-"}</TableCell>
                <TableCell className="text-right">
                  <Link to={`/dashboard/admin/tickets/${t.id}`}>
                    <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
