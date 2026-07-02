import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function Security() {
  const { authFetch } = useAuth()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)

  const changePassword = async () => {
    if (!currentPassword || !newPassword) { toast.error("Fill in all fields"); return }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return }
    setSaving(true)
    const r = await authFetch("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword })
    })
    const data = await r.json()
    if (data.success) {
      toast.success("Password updated")
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    } else toast.error(data.error || "Failed to update password")
    setSaving(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Security</h1>
      <Card className="border-border max-w-2xl">
        <CardHeader><CardTitle className="text-base">Change Password</CardTitle><CardDescription>Update your password regularly for security.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div><Label htmlFor="current">Current Password</Label><Input id="current" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="mt-1" /></div>
          <div><Label htmlFor="new">New Password</Label><Input id="new" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1" /></div>
          <div><Label htmlFor="confirm">Confirm New Password</Label><Input id="confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1" /></div>
          <Separator />
          <Button onClick={changePassword} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
