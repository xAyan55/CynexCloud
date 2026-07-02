import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function Security() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Security</h1>
      <Card className="border-border max-w-2xl">
        <CardHeader><CardTitle className="text-base">Change Password</CardTitle><CardDescription>Update your password regularly for security.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div><Label htmlFor="current">Current Password</Label><Input id="current" type="password" className="mt-1" /></div>
          <div><Label htmlFor="new">New Password</Label><Input id="new" type="password" className="mt-1" /></div>
          <div><Label htmlFor="confirm">Confirm New Password</Label><Input id="confirm" type="password" className="mt-1" /></div>
          <Separator />
          <Button>Update Password</Button>
        </CardContent>
      </Card>
    </div>
  )
}
