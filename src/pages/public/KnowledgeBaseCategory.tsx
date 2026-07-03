import { Link, useParams } from "react-router-dom"
import { ChevronLeft, ChevronRight, Server, Cloud, Bot, HelpCircle, FileText, BookOpen } from "lucide-react"
import { CATEGORIES, ARTICLES } from "@/data/knowledgeBase"
import SEO from "@/components/SEO"

const ICONS: Record<string, any> = { Server, Cloud, Bot, FileText, BookOpen, HelpCircle }

export default function KnowledgeBaseCategory() {
  const { category } = useParams<{ category: string }>()
  const cat = CATEGORIES.find(c => c.slug === category)
  const articles = ARTICLES.filter(a => a.categorySlug === category)

  if (!cat) {
    return (
      <div className="py-24">
        <SEO title="Category Not Found" description="The requested knowledge base category could not be found." path={`/knowledge-base/${category}`} />
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-2xl font-bold font-heading mb-4">Category not found</h1>
          <Link to="/knowledge-base" className="text-sm text-zinc-400 hover:text-zinc-200 underline underline-offset-4">
            Back to Knowledge Base
          </Link>
        </div>
      </div>
    )
  }

  const Icon = ICONS[cat.icon] || BookOpen

  return (
    <div className="py-24">
      <SEO title={`${cat.name} Guides`} description={`Browse guides and articles about ${cat.name}`} path={`/knowledge-base/${category}`} />
      <div className="mx-auto max-w-4xl px-6">
        <Link
          to="/knowledge-base"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          All Categories
        </Link>

        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
            <Icon className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight">{cat.name}</h1>
            <p className="text-zinc-400 mt-1">{cat.description}</p>
          </div>
        </div>

        <div className="space-y-2">
          {articles.map((article) => (
            <Link
              key={article.slug}
              to={`/knowledge-base/${cat.slug}/${article.slug}`}
              className="flex items-center justify-between p-5 rounded-lg border border-zinc-800/60 hover:border-zinc-600 hover:bg-accent/20 transition-colors group"
            >
              <div className="min-w-0">
                <p className="text-base font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">
                  {article.title}
                </p>
                <p className="text-sm text-zinc-500 mt-1">{article.excerpt}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 ml-4" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
