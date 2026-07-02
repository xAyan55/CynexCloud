import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, BookOpen } from "lucide-react"

export default function Knowledgebase() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Knowledge Base</h1>
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search articles..." className="pl-10" />
      </div>
      <Card className="border-border">
        <CardContent className="flex flex-col items-center py-16">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-foreground font-medium mb-2">Knowledge base coming soon</p>
          <p className="text-muted-foreground text-sm">Articles and guides will be available here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
