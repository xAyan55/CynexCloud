import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { History } from "lucide-react"

const SAMPLE_PAYMENTS = [
  { id: "PAY-001", date: "2026-06-01", amount: "₹80", method: "PayPal", status: "completed" },
  { id: "PAY-002", date: "2026-05-01", amount: "₹80", method: "PayPal", status: "completed" },
]

export default function PaymentHistory() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Payment History</h1>
      {SAMPLE_PAYMENTS.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16">
            <History className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-2">No payments yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <Table>
            <TableHeader><TableRow><TableHead>Transaction</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {SAMPLE_PAYMENTS.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-foreground">{p.id}</TableCell>
                  <TableCell className="text-muted-foreground">{p.date}</TableCell>
                  <TableCell className="text-foreground">{p.amount}</TableCell>
                  <TableCell className="text-muted-foreground">{p.method}</TableCell>
                  <TableCell><Badge variant={p.status === "completed" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
