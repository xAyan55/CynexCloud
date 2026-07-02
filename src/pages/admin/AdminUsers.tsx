import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const USERS: any[] = []

export default function AdminUsers() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Manage Users</h1>
      {USERS.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16">
            <p className="text-foreground font-medium mb-2">No users</p>
            <p className="text-muted-foreground text-sm">Registered users will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <Table>
            <TableHeader><TableRow><TableHead>Username</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {USERS.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell className="text-foreground">{u.username}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground">{u.role}</TableCell>
                  <TableCell><Badge variant={u.active ? "default" : "secondary"}>{u.active ? "Active" : "Banned"}</Badge></TableCell>
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
