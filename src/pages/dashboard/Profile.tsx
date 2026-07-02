import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function Profile() {
  const { user, authFetch } = useAuth()
  const [username, setUsername] = useState(user?.username || "")
  const [email, setEmail] = useState(user?.email || "")
  const [saving, setSaving] = useState(false)

  const saveProfile = async () => {
    setSaving(true)
    const r = await authFetch("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ username, email })
    })
    const data = await r.json()
    if (data.success) toast.success("Profile updated")
    else toast.error(data.error || "Failed to update profile")
    setSaving(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Profile</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-border md:col-span-1">
          <CardContent className="flex flex-col items-center py-8">
            <Avatar className="w-20 h-20 mb-4">
              <AvatarFallback className="text-2xl bg-muted text-foreground">{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <p className="text-lg font-medium text-foreground">{user?.username}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </CardContent>
        </Card>
        <Card className="border-border md:col-span-2">
          <CardHeader><CardTitle className="text-base">Account Details</CardTitle><CardDescription>Update your account information.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Username</Label><Input value={username} onChange={e => setUsername(e.target.value)} className="mt-1" /></div>
            <div><Label>Email</Label><Input value={email} onChange={e => setEmail(e.target.value)} className="mt-1" /></div>
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
