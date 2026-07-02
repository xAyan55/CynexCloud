import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { History, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function PaymentHistory() {
  const { authFetch } = useAuth()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch("/api/payments/history")
      .then(r => r.json())
      .then(data => { if (data.success) setPayments(data.history || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Payment History</h1>
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : payments.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16">
            <History className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-2">No payments yet</p>
            <p className="text-muted-foreground text-sm">Your payment history will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <Table>
            <TableHeader><TableRow><TableHead>Transaction</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {payments.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id || p.transactionHash?.slice(0, 12) || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{p.paidAt || p.createdAt ? new Date(p.paidAt || p.createdAt).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{p.paymentAmount || p.amount ? `${p.paymentCurrency || "USD"} ${p.paymentAmount || p.amount}` : "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{p.paymentProvider || "OxaPay"}</TableCell>
                  <TableCell><Badge variant={p.status === "Paid" ? "default" : "secondary"}>{p.paymentStatus || p.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
