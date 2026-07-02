import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Megaphone, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function Announcements() {
  const { authFetch } = useAuth()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch("/api/announcements")
      .then(r => r.json())
      .then(data => { if (data.success) setAnnouncements(data.announcements || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Announcements</h1>
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : announcements.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-16">
            <Megaphone className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-2">No announcements</p>
            <p className="text-muted-foreground text-sm">Check back later for updates.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((a: any) => (
            <Card key={a.id} className="border-border">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                </div>
                <CardDescription>{a.createdAt ? new Date(a.createdAt).toLocaleString() : ""} &middot; {a.category || "Platform"}</CardDescription>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.content}</p></CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
