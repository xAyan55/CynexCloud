import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

const PLANS: any[] = []

export default function AdminPlans() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading tracking-tight">Manage Plans</h1>
        <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Plan</Button>
      </div>
      {PLANS.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16">
            <p className="text-foreground font-medium mb-2">No plans configured</p>
            <p className="text-muted-foreground text-sm">Add hosting plans to display on the pricing page.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {PLANS.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="text-foreground">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.category}</TableCell>
                  <TableCell className="text-foreground">{p.price}</TableCell>
                  <TableCell><Badge>{p.active ? "Active" : "Disabled"}</Badge></TableCell>
                  <TableCell><Button variant="ghost" size="sm">Edit</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
