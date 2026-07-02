import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

const TICKETS: any[] = []

export default function AdminTickets() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">All Tickets</h1>
      {TICKETS.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16">
            <p className="text-foreground font-medium mb-2">No support tickets</p>
            <p className="text-muted-foreground text-sm">All customer tickets will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <Table>
            <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>User</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {TICKETS.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="text-foreground">{t.subject}</TableCell>
                  <TableCell className="text-muted-foreground">{t.user}</TableCell>
                  <TableCell><Badge variant="secondary">{t.status}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{t.priority}</Badge></TableCell>
                  <TableCell><Link to={`/dashboard/admin/tickets/${t.id}`}><Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button></Link></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
