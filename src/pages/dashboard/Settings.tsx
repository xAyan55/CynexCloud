import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function Settings() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Settings</h1>
      <div className="space-y-6 max-w-2xl">
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Notifications</CardTitle><CardDescription>Manage your notification preferences.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label htmlFor="email-notif">Email Notifications</Label><Switch id="email-notif" defaultChecked /></div>
            <div className="flex items-center justify-between"><Label htmlFor="billing-notif">Billing Alerts</Label><Switch id="billing-notif" defaultChecked /></div>
            <div className="flex items-center justify-between"><Label htmlFor="ticket-notif">Ticket Updates</Label><Switch id="ticket-notif" defaultChecked /></div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label htmlFor="compact">Compact Mode</Label><Switch id="compact" /></div>
            <Separator />
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
