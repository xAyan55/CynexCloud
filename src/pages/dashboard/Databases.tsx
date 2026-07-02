import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Database } from "lucide-react"

export default function Databases() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Databases</h1>
      <Card className="border-border">
        <CardContent className="flex flex-col items-center py-16">
          <Database className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-foreground font-medium mb-2">No databases</p>
          <p className="text-muted-foreground text-sm mb-6">Create a database for your service.</p>
          <Button>Create Database</Button>
        </CardContent>
      </Card>
    </div>
  )
}
