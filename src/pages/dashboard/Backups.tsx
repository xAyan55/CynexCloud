import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Archive, Download, RotateCcw } from "lucide-react"

const SAMPLE_BACKUPS = [
  { id: "1", name: "Backup 1", date: "2026-06-30", size: "2.4 GB", status: "completed" },
  { id: "2", name: "Backup 2", date: "2026-06-23", size: "2.3 GB", status: "completed" },
]

export default function Backups() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Backups</h1>
      {SAMPLE_BACKUPS.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16">
            <Archive className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-2">No backups yet</p>
            <p className="text-muted-foreground text-sm">Backups will appear here once created.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Date</TableHead><TableHead>Size</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {SAMPLE_BACKUPS.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="text-foreground">{b.name}</TableCell>
                  <TableCell className="text-muted-foreground">{b.date}</TableCell>
                  <TableCell className="text-muted-foreground">{b.size}</TableCell>
                  <TableCell><Badge variant="default">{b.status}</Badge></TableCell>
                  <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button><Button variant="ghost" size="icon"><RotateCcw className="w-4 h-4" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
