import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function CreateTicket() {
  const { authFetch } = useAuth()
  const navigate = useNavigate()
  const [subject, setSubject] = useState("")
  const [priority, setPriority] = useState("low")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await authFetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, priority, message })
      })
      if (res.ok) navigate("/dashboard/support")
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Link to="/dashboard/support" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Tickets
      </Link>
      <Card className="border-border max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Create Ticket</CardTitle>
          <CardDescription>Describe your issue and we'll get back to you.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief description of the issue" required />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority" className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue in detail" className="min-h-[200px]" required />
            </div>
            <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Ticket"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
