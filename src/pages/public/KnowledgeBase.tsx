import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Server, Cloud, Bot, HelpCircle, FileText, BookOpen } from "lucide-react"

const CATEGORIES: {
  name: string; icon: any; description: string; articles: { title: string; excerpt: string }[]
}[] = [
  {
    name: "Minecraft Hosting", icon: Server, description: "Server setup, modpack installation, configuration guides",
    articles: [
      { title: "How to install a modpack", excerpt: "Step-by-step guide to installing any modpack on your Minecraft server." },
      { title: "Configuring server properties", excerpt: "Optimize your server experience by configuring server.properties." },
      { title: "Setting up permissions", excerpt: "Learn how to set up permission groups with LuckPerms." },
    ]
  },
  {
    name: "VPS Hosting", icon: Cloud, description: "Server management, security, optimization tips",
    articles: [
      { title: "Securing your VPS", excerpt: "Essential security measures to protect your virtual private server." },
      { title: "Performance optimization", excerpt: "Tips to optimize your VPS for maximum performance." },
    ]
  },
  {
    name: "Discord Bots", icon: Bot, description: "Bot deployment, troubleshooting, best practices",
    articles: [
      { title: "Deploying your first bot", excerpt: "Get your Discord bot online in minutes with our deployment guide." },
      { title: "Common bot errors", excerpt: "Troubleshooting frequent issues with Discord bot hosting." },
    ]
  },
  {
    name: "Billing", icon: FileText, description: "Payments, invoices, refunds, plan changes",
    articles: [
      { title: "Understanding your invoice", excerpt: "A breakdown of charges, taxes, and billing cycles." },
      { title: "How to upgrade your plan", excerpt: "Easily switch to a higher tier plan from your dashboard." },
    ]
  },
  {
    name: "Getting Started", icon: BookOpen, description: "Account setup, first steps, quick start guides",
    articles: [
      { title: "Creating your account", excerpt: "Sign up and verify your email to get started." },
      { title: "Your first server deployment", excerpt: "From plan selection to server online in under 60 seconds." },
    ]
  },
  {
    name: "FAQ", icon: HelpCircle, description: "Common questions and answers",
    articles: [
      { title: "What payment methods do you accept?", excerpt: "We accept Bitcoin, USDT, ETH, and 150+ cryptocurrencies via OxaPay." },
      { title: "How long does provisioning take?", excerpt: "Servers are deployed automatically within seconds of payment confirmation." },
      { title: "Can I get a refund?", excerpt: "Yes, we offer a 7-day money-back guarantee on all plans." },
    ]
  },
]

export default function KnowledgeBase() {
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)

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
          {filtered.map((cat) => {
            const isOpen = expanded === cat.name
            return (
              <Card
                key={cat.name}
                className="border-border hover:border-zinc-600 transition-colors cursor-pointer"
                onClick={() => setExpanded(isOpen ? null : cat.name)}
              >
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-2">
                    <cat.icon className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-base">{cat.name}</CardTitle>
                  <CardDescription>{cat.description}</CardDescription>
                  <span className="text-xs text-muted-foreground mt-2">{cat.articles.length} articles</span>
                </CardHeader>
                {isOpen && (
                  <div className="px-6 pb-6 space-y-3">
                    {cat.articles.map((article) => (
                      <div key={article.title} className="p-3 rounded-lg bg-accent/40 border border-border">
                        <p className="text-sm font-medium">{article.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{article.excerpt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
