import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function AdminPlans() {
  const { authFetch } = useAuth()
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editPlan, setEditPlan] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadPlans = () => {
    setLoading(true)
    fetch("/api/plans")
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : []
        setPlans(list)
      })
      .catch(() => toast.error("Failed to load plans"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadPlans() }, [])

  const openCreate = () => {
    setEditPlan({ id: "", name: "", price: "", price_numeric: 0, category: "minecraft", ram: "", cpu: "", storage: "", description: "", features: [], popular: false })
    setDialogOpen(true)
  }

  const openEdit = (plan: any) => {
    setEditPlan({ ...plan })
    setDialogOpen(true)
  }

  const save = async () => {
    if (!editPlan?.name || !editPlan?.id) { toast.error("Name and ID are required"); return }
    setSaving(true)
    const payload = { ...editPlan, price_numeric: parseFloat(editPlan.price_numeric || editPlan.price || "0") }
    const r = await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${document.cookie.split("accessToken=")[1]?.split(";")[0]}` },
      body: JSON.stringify(payload)
    })
    const data = await r.json()
    if (r.ok) {
      toast.success("Plan saved")
      setDialogOpen(false)
      loadPlans()
    } else toast.error(data.error || "Failed to save plan")
    setSaving(false)
  }

  const deletePlan = async (id: string) => {
    if (!confirm("Delete this plan?")) return
    const r = await fetch(`/api/admin/plans/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${document.cookie.split("accessToken=")[1]?.split(";")[0]}` }
    })
    if (r.ok) {
      toast.success("Plan deleted")
      loadPlans()
    } else toast.error("Failed to delete plan")
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading tracking-tight">Manage Plans</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />Add Plan</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>{editPlan?.id ? "Edit Plan" : "Create Plan"}</DialogTitle></DialogHeader>
            {editPlan && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Plan ID</Label>
                    <Input value={editPlan.id} onChange={e => setEditPlan({ ...editPlan, id: e.target.value })} placeholder="vps-pro" disabled={!!editPlan?.originalPrice} />
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={editPlan.name} onChange={e => setEditPlan({ ...editPlan, name: e.target.value })} placeholder="Cloud Pro" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={editPlan.category} onValueChange={v => setEditPlan({ ...editPlan, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minecraft">Minecraft</SelectItem>
                        <SelectItem value="vps">VPS</SelectItem>
                        <SelectItem value="discord">Discord Bot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Price (numeric)</Label>
                    <Input type="number" value={editPlan.price_numeric || editPlan.price} onChange={e => setEditPlan({ ...editPlan, price_numeric: e.target.value, price: e.target.value  })} placeholder="1200" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>RAM</Label>
                    <Input value={editPlan.ram || ""} onChange={e => setEditPlan({ ...editPlan, ram: e.target.value })} placeholder="4GB" />
                  </div>
                  <div className="space-y-2">
                    <Label>CPU</Label>
                    <Input value={editPlan.cpu || ""} onChange={e => setEditPlan({ ...editPlan, cpu: e.target.value })} placeholder="2 vCores" />
                  </div>
                  <div className="space-y-2">
                    <Label>Storage</Label>
                    <Input value={editPlan.storage || ""} onChange={e => setEditPlan({ ...editPlan, storage: e.target.value })} placeholder="80GB NVMe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={editPlan.description || ""} onChange={e => setEditPlan({ ...editPlan, description: e.target.value })} placeholder="Ideal for small projects..." />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : plans.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16">
            <p className="text-foreground font-medium mb-2">No plans configured</p>
            <p className="text-muted-foreground text-sm">Add hosting plans to display on the pricing page.</p>
          </CardContent>
        </Card>
      ) : (() => {
        const categories = [
          { key: "minecraft", label: "Minecraft Hosting" },
          { key: "vps", label: "VPS Hosting" },
          { key: "discord", label: "Discord Bot Hosting" },
        ]
        return categories.map(cat => {
          const catPlans = plans.filter(p => p.category === cat.key)
          if (catPlans.length === 0) return null
          return (
            <div key={cat.key} className="mb-8">
              <h2 className="text-lg font-semibold font-heading tracking-tight mb-3">{cat.label}</h2>
              <Card className="border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>RAM</TableHead>
                      <TableHead>CPU</TableHead>
                      <TableHead>Storage</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {catPlans.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.price || p.price_numeric}</TableCell>
                        <TableCell className="text-muted-foreground">{p.ram || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{p.cpu || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{p.storage || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => deletePlan(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )
        })
      })()}
    </div>
  )
}
