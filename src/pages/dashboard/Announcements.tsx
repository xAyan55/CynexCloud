import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Megaphone } from "lucide-react"

const SAMPLE: any[] = []

export default function Announcements() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Announcements</h1>
      {SAMPLE.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16">
            <Megaphone className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-2">No announcements</p>
            <p className="text-muted-foreground text-sm">Check back later for updates.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {SAMPLE.map((a: any) => (
            <Card key={a.id} className="border-border">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  {a.pinned && <Badge variant="default">Pinned</Badge>}
                </div>
                <CardDescription>{a.date}</CardDescription>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{a.content}</p></CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
