import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function Settings() {
  const { authFetch } = useAuth()
  const [emailNotif, setEmailNotif] = useState(true)
  const [billingNotif, setBillingNotif] = useState(true)
  const [ticketNotif, setTicketNotif] = useState(true)
  const [compact, setCompact] = useState(false)

  const deleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return
    toast.error("Account deletion is not available through the panel. Contact support.")
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Settings</h1>
      <div className="space-y-6 max-w-2xl">
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Notifications</CardTitle><CardDescription>Manage your notification preferences.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label htmlFor="email-notif">Email Notifications</Label><Switch id="email-notif" checked={emailNotif} onCheckedChange={setEmailNotif} /></div>
            <div className="flex items-center justify-between"><Label htmlFor="billing-notif">Billing Alerts</Label><Switch id="billing-notif" checked={billingNotif} onCheckedChange={setBillingNotif} /></div>
            <div className="flex items-center justify-between"><Label htmlFor="ticket-notif">Ticket Updates</Label><Switch id="ticket-notif" checked={ticketNotif} onCheckedChange={setTicketNotif} /></div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label htmlFor="compact">Compact Mode</Label><Switch id="compact" checked={compact} onCheckedChange={setCompact} /></div>
            <Separator />
            <Button variant="destructive" onClick={deleteAccount}>Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
