import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"

export default function Profile() {
  const { user } = useAuth()

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
            <Button variant="outline" size="sm" className="mt-4">Change Avatar</Button>
          </CardContent>
        </Card>
        <Card className="border-border md:col-span-2">
          <CardHeader><CardTitle className="text-base">Account Details</CardTitle><CardDescription>Update your account information.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Username</Label><Input defaultValue={user?.username} className="mt-1" /></div>
            <div><Label>Email</Label><Input defaultValue={user?.email} className="mt-1" /></div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
