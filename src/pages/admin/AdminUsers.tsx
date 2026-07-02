import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { Search, Loader2, ShieldCheck, ShieldX, Ban, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

export default function AdminUsers() {
  const { authFetch } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const loadUsers = () => {
    setLoading(true)
    authFetch("/api/admin/users")
      .then(r => r.json())
      .then(data => { if (data.success) setUsers(data.users) })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadUsers() }, [])

  const toggleBan = async (id: string, currentBanned: number) => {
    const newBanned = currentBanned ? 0 : 1
    const r = await authFetch(`/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify({ banned: newBanned }) })
    const data = await r.json()
    if (data.success) {
      toast.success(newBanned ? "User suspended" : "User unsuspended")
      loadUsers()
    } else toast.error(data.error || "Failed")
  }

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin"
    const r = await authFetch(`/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify({ role: newRole }) })
    const data = await r.json()
    if (data.success) {
      toast.success(`Role changed to ${newRole}`)
      loadUsers()
    } else toast.error(data.error || "Failed")
  }

  const filtered = users.filter(u => 
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading tracking-tight">Manage Users</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <Card className="border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
            ) : filtered.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.username}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                </TableCell>
                <TableCell>
                  {u.emailVerified ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
                </TableCell>
                <TableCell>
                  <Badge variant={u.banned ? "destructive" : "default"}>{u.banned ? "Banned" : "Active"}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => toggleRole(u.id, u.role)} title="Toggle admin role">
                      {u.role === "admin" ? <ShieldX className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleBan(u.id, u.banned)} title={u.banned ? "Unsuspend" : "Suspend"}>
                      {u.banned ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Ban className="w-4 h-4" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
