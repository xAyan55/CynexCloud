import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function Subusers() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Subusers</h1>
      <Card className="border-border">
        <CardContent className="flex flex-col items-center py-16">
          <Users className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-foreground font-medium mb-2">No subusers</p>
          <p className="text-muted-foreground text-sm">Invite users to help manage your services.</p>
        </CardContent>
      </Card>
    </div>
  )
}
