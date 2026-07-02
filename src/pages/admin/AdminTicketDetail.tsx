import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, Send } from "lucide-react"

export default function AdminTicketDetail() {
  const { id } = useParams()
  const [reply, setReply] = useState("")

  return (
    <div>
      <Link to="/dashboard/admin/tickets" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Tickets
      </Link>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Ticket #{id}</CardTitle>
                <Badge variant="secondary">Open</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium text-foreground mb-1">Customer</p>
                <p className="text-sm text-muted-foreground">Ticket created. Awaiting support response.</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader><CardTitle className="text-sm">Reply</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." className="min-h-[120px] mb-3" />
              <Button><Send className="w-4 h-4 mr-1" /> Send Reply</Button>
            </CardContent>
          </Card>
        </div>
        <Card className="border-border h-fit">
          <CardHeader><CardTitle className="text-sm">Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="secondary">Open</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><Badge variant="outline">Low</Badge></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">User</span><span className="text-foreground">customer@example.com</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
