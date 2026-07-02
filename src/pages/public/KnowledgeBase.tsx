import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Server, Cloud, Bot, HelpCircle, FileText, BookOpen } from "lucide-react"

const CATEGORIES = [
  { name: "Minecraft Hosting", icon: Server, description: "Server setup, modpack installation, configuration guides", articles: 12 },
  { name: "VPS Hosting", icon: Cloud, description: "Server management, security, optimization tips", articles: 8 },
  { name: "Discord Bots", icon: Bot, description: "Bot deployment, troubleshooting, best practices", articles: 6 },
  { name: "Billing", icon: FileText, description: "Payments, invoices, refunds, plan changes", articles: 5 },
  { name: "Getting Started", icon: BookOpen, description: "Account setup, first steps, quick start guides", articles: 10 },
  { name: "FAQ", icon: HelpCircle, description: "Common questions and answers", articles: 15 },
]

export default function KnowledgeBase() {
  const [search, setSearch] = useState("")
  const filtered = CATEGORIES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-heading tracking-tight mb-4">Knowledge Base</h1>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Find answers to common questions and learn how to get the most out of your services.</p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search articles..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((cat) => (
            <Card key={cat.name} className="border-border hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-2">
                  <cat.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <CardTitle className="text-base">{cat.name}</CardTitle>
                <CardDescription>{cat.description}</CardDescription>
                <span className="text-xs text-muted-foreground mt-2">{cat.articles} articles</span>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
