import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ticket, Plus, Eye } from "lucide-react"

const SAMPLE_TICKETS: any[] = []

export default function Tickets() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading tracking-tight">Support Tickets</h1>
        <Link to="/dashboard/support/create"><Button size="sm"><Plus className="w-4 h-4 mr-1" />New Ticket</Button></Link>
      </div>
      {SAMPLE_TICKETS.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16">
            <Ticket className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-2">No tickets</p>
            <p className="text-muted-foreground text-sm mb-6">Create a support ticket if you need help.</p>
            <Link to="/dashboard/support/create"><Button>Create Ticket</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <Table>
            <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead>Last Updated</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {SAMPLE_TICKETS.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="text-foreground">{t.subject}</TableCell>
                  <TableCell><Badge variant="secondary">{t.status}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{t.priority}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{t.updatedAt}</TableCell>
                  <TableCell><Link to={`/dashboard/support/${t.id}`}><Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button></Link></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
