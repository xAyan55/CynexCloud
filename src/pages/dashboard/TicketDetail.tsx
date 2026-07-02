import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, Send, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function TicketDetail() {
  const { id } = useParams()
  const { authFetch } = useAuth()
  const [ticket, setTicket] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const load = () => {
    if (!id) return
    setLoading(true)
    authFetch(`/api/tickets/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setTicket(data.ticket)
          setMessages(data.messages || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const sendReply = async () => {
    if (!reply.trim() || !id) return
    setSending(true)
    const r = await authFetch(`/api/tickets/${id}/reply`, {
      method: "POST",
      body: JSON.stringify({ message: reply })
    })
    const data = await r.json()
    if (data.success) {
      toast.success("Reply sent")
      setReply("")
      load()
    } else toast.error(data.error || "Failed to send reply")
    setSending(false)
  }

  const closeTicket = async () => {
    if (!id) return
    const r = await authFetch(`/api/tickets/${id}/close`, { method: "PUT" })
    const data = await r.json()
    if (data.success) { toast.success("Ticket closed"); load() }
    else toast.error(data.error || "Failed to close ticket")
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>

  if (!ticket) return (
    <div className="text-center py-16">
      <p className="text-muted-foreground">Ticket not found.</p>
      <Link to="/dashboard/support"><Button variant="outline" className="mt-4">Back</Button></Link>
    </div>
  )

  const statusColor = (s: string) => {
    if (s === "open") return "default" as const
    if (s === "answered") return "secondary" as const
    return "outline" as const
  }

  return (
    <div>
      <Link to="/dashboard/support" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Tickets
      </Link>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{ticket.subject}</CardTitle>
                <Badge variant={statusColor(ticket.status)}>{ticket.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No messages.</p>
              ) : messages.map((m: any) => (
                <div key={m.id} className={`rounded-lg p-4 ${m.isStaff ? "bg-primary/10 border border-primary/20" : "bg-muted"}`}>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {m.isStaff ? "Staff" : "You"} &middot; {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{m.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          {ticket.status !== "closed" && (
            <Card className="border-border">
              <CardHeader><CardTitle className="text-sm">Reply</CardTitle></CardHeader>
              <CardContent>
                <Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." className="min-h-[120px] mb-3" />
                <div className="flex gap-2">
                  <Button onClick={sendReply} disabled={sending || !reply.trim()}>
                    {sending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                    Send Reply
                  </Button>
                  <Button variant="outline" onClick={closeTicket}>Close Ticket</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <Card className="border-border h-fit">
          <CardHeader><CardTitle className="text-sm">Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={statusColor(ticket.status)}>{ticket.status}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><Badge variant="outline">{ticket.priority}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="text-foreground">{ticket.category}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span className="text-foreground">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "-"}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
