import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function Invoices() {
  const { authFetch } = useAuth()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch("/api/invoices")
      .then(r => r.json())
      .then(data => { if (data.success) setInvoices(data.invoices || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Invoices</h1>
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : invoices.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-2">No invoices</p>
            <p className="text-muted-foreground text-sm">Your invoices will appear here after placing an order.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <Table>
            <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Payment</TableHead></TableRow></TableHeader>
            <TableBody>
              {invoices.map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.id}</TableCell>
                  <TableCell className="text-muted-foreground">{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{inv.amount ? `${inv.paymentCurrency || "USD"} ${inv.amount}` : "-"}</TableCell>
                  <TableCell><Badge variant={inv.status === "Paid" ? "default" : inv.status === "Unpaid" ? "secondary" : "outline"}>{inv.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{inv.paymentProvider || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
