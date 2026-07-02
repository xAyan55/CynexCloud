import { Card, CardContent } from "@/components/ui/card"
import { CalendarClock } from "lucide-react"

export default function Schedules() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Schedules</h1>
      <Card className="border-border">
        <CardContent className="flex flex-col items-center py-16">
          <CalendarClock className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-foreground font-medium mb-2">No schedules</p>
          <p className="text-muted-foreground text-sm">Create scheduled tasks for your services.</p>
        </CardContent>
      </Card>
    </div>
  )
}
