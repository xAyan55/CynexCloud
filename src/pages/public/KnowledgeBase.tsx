import { useState } from "react"
import { Link } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Server, Cloud, Bot, HelpCircle, FileText, BookOpen, ChevronRight } from "lucide-react"
import { CATEGORIES, ARTICLES } from "@/data/knowledgeBase"

const ICONS: Record<string, any> = { Server, Cloud, Bot, FileText, BookOpen, HelpCircle }

export default function KnowledgeBase() {
  const [search, setSearch] = useState("")

  const filtered = CATEGORIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  )

  const searchArticles = search.trim()
    ? ARTICLES.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(search.toLowerCase())
      )
    : []

  return (
    <div className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-heading tracking-tight mb-4">Knowledge Base</h1>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find answers to common questions and learn how to get the most out of your services.
          </p>
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

        {search.trim() && searchArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Search Results</h2>
            <div className="space-y-1">
              {searchArticles.slice(0, 8).map((article) => (
                <Link
                  key={article.slug}
                  to={`/knowledge-base/${article.categorySlug}/${article.slug}`}
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{article.title}</p>
                    <p className="text-xs text-zinc-500">{article.categoryName}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!search.trim() && (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              {filtered.map((cat) => {
                const Icon = ICONS[cat.icon]
                const count = ARTICLES.filter(a => a.categorySlug === cat.slug).length
                return (
                  <Link key={cat.slug} to={`/knowledge-base/${cat.slug}`}>
                    <Card className="card-hover border-border hover:border-zinc-600 transition-colors h-full group">
                      <CardHeader>
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-2">
                          <Icon className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <CardTitle className="text-base flex items-center gap-1.5">
                          {cat.name}
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                        </CardTitle>
                        <CardDescription>{cat.description}</CardDescription>
                        <span className="text-xs text-muted-foreground mt-2">{count} articles</span>
                      </CardHeader>
                    </Card>
                  </Link>
                )
              })}
            </div>

            <div className="mt-16">
              <h2 className="text-xl font-heading font-bold tracking-tight mb-6">All Articles</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {ARTICLES.map((article) => {
                  const cat = CATEGORIES.find(c => c.slug === article.categorySlug)
                  const Icon = cat ? ICONS[cat.icon] : BookOpen
                  return (
                    <Link
                      key={article.slug}
                      to={`/knowledge-base/${article.categorySlug}/${article.slug}`}
                      className="flex items-start gap-3 p-4 rounded-lg border border-zinc-800/60 hover:border-zinc-600 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-accent-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors truncate">
                          {article.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">{article.excerpt}</p>
                        <span className="text-[11px] text-zinc-600 mt-1 inline-block">{cat?.name}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
