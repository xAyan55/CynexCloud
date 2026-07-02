import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Key, Plus, Trash2, Loader2, Copy } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function ApiKeys() {
  const { authFetch } = useAuth()
  const [keys, setKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadKeys = () => {
    setLoading(true)
    authFetch("/api/api-keys")
      .then(r => r.json())
      .then(data => { if (data.success) setKeys(data.keys || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadKeys() }, [])

  const createKey = async () => {
    if (!name.trim()) { toast.error("Name is required"); return }
    setCreating(true)
    const r = await authFetch("/api/api-keys", {
      method: "POST",
      body: JSON.stringify({ name })
    })
    const data = await r.json()
    if (data.success) {
      setNewKey(data.key || data.rawKey || "")
      toast.success("API key created")
      loadKeys()
    } else toast.error(data.error || "Failed to create key")
    setCreating(false)
  }

  const deleteKey = async (id: string) => {
    if (!confirm("Delete this API key?")) return
    const r = await authFetch(`/api/api-keys/${id}`, { method: "DELETE" })
    const data = await r.json()
    if (data.success) { toast.success("Key deleted"); loadKeys() }
    else toast.error(data.error || "Failed to delete key")
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading tracking-tight">API Keys</h1>
        <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) { setNewKey(""); setName("") } }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" />Create Key</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{newKey ? "API Key Created" : "Create API Key"}</DialogTitle></DialogHeader>
            {newKey ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Copy this key now. You won't be able to see it again.</p>
                <div className="flex gap-2">
                  <Input value={newKey} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(newKey); toast.success("Copied") }}><Copy className="w-4 h-4" /></Button>
                </div>
                <Button onClick={() => { setDialogOpen(false); setNewKey("") }}>Done</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Key Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="My API Key" />
                </div>
                <Button onClick={createKey} disabled={creating}>
                  {creating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}Generate Key
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : keys.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16">
            <Key className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-2">No API keys</p>
            <p className="text-muted-foreground text-sm">Create an API key to access the API programmatically.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Created</TableHead><TableHead>Last Used</TableHead><TableHead>Expires</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {keys.map((k: any) => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "-"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : "Never"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : "Never"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => deleteKey(k.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
