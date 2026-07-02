import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Key, Plus } from "lucide-react"

export default function ApiKeys() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading tracking-tight">API Keys</h1>
        <Button size="sm"><Plus className="w-4 h-4 mr-1" />Create Key</Button>
      </div>
      <Card className="border-border">
        <CardContent className="flex flex-col items-center py-16">
          <Key className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-foreground font-medium mb-2">No API keys</p>
          <p className="text-muted-foreground text-sm">Create an API key to access the API programmatically.</p>
        </CardContent>
      </Card>
    </div>
  )
}
