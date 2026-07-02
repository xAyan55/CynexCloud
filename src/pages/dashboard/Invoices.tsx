import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"

const SAMPLE_INVOICES = [
  { id: "INV-001", date: "2026-06-01", amount: "₹80", status: "paid", description: "Zombie Plan - Monthly" },
  { id: "INV-002", date: "2026-05-01", amount: "₹80", status: "paid", description: "Zombie Plan - Monthly" },
]

export default function Invoices() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Invoices</h1>
      {SAMPLE_INVOICES.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-2">No invoices</p>
            <p className="text-muted-foreground text-sm">Your invoices will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <Table>
            <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {SAMPLE_INVOICES.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="text-foreground">{inv.id}</TableCell>
                  <TableCell className="text-muted-foreground">{inv.date}</TableCell>
                  <TableCell className="text-muted-foreground">{inv.description}</TableCell>
                  <TableCell className="text-foreground">{inv.amount}</TableCell>
                  <TableCell><Badge variant={inv.status === "paid" ? "default" : "secondary"}>{inv.status}</Badge></TableCell>
                  <TableCell><Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
