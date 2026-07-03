import { useParams, Link } from "react-router-dom"
import { ChevronLeft, Server, Cloud, Bot, FileText, BookOpen, HelpCircle } from "lucide-react"
import { ARTICLES, CATEGORIES } from "@/data/knowledgeBase"
import SEO from "@/components/SEO"

const ICONS: Record<string, any> = { Server, Cloud, Bot, FileText, BookOpen, HelpCircle }

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function renderContent(content: string) {
  const lines = content.split("\n")
  const elements: JSX.Element[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]
    const lineNum = key++

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      i++
      elements.push(
        <pre key={lineNum} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto text-sm my-4">
          <code>{escapeHtml(codeLines.join("\n"))}</code>
        </pre>
      )
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={lineNum} className="text-xl font-heading font-bold text-zinc-100 mt-8 mb-3 pb-2 border-b border-zinc-800">
          {line.slice(3)}
        </h2>
      )
      i++
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={lineNum} className="text-lg font-heading font-semibold text-zinc-200 mt-6 mb-2">
          {line.slice(4)}
        </h3>
      )
      i++
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <p key={lineNum} className="font-semibold text-zinc-200 mt-4 mb-1">{line.slice(2, -2)}</p>
      )
      i++
    } else if (line.startsWith("- [") && line.includes("] ")) {
      const checkEnd = line.indexOf("]")
      const checked = line[2] === "x"
      const text = line.slice(checkEnd + 2)
      elements.push(
        <div key={lineNum} className="flex items-start gap-2 text-sm text-zinc-300 my-1">
          <span className="text-emerald-500 mt-0.5 shrink-0">{checked ? "?" : "?"}</span>
          <span>{text}</span>
        </div>
      )
      i++
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={lineNum} className="text-zinc-300 ml-4 list-disc text-sm my-0.5">{line.slice(2)}</li>
      )
      i++
    } else if (line.startsWith("| ")) {
      const rows: string[] = []
      while (i < lines.length && lines[i].startsWith("|")) {
        rows.push(lines[i])
        i++
      }
      const parsedRows = rows.map(r => r.split("|").filter(c => c.trim()).map(c => c.trim()))
      if (parsedRows.length >= 2) {
        const headerRow = parsedRows[0]
        const isSeparator = parsedRows[1][0]?.startsWith("-")
        const bodyRows = isSeparator ? parsedRows.slice(2) : parsedRows.slice(1)
        elements.push(
          <div key={lineNum} className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-700">
                  {headerRow.map((h, idx) => (
                    <th key={idx} className="text-left py-2 px-3 text-zinc-300 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ridx) => (
                  <tr key={ridx} className="border-b border-zinc-800/60">
                    {row.map((cell, cidx) => (
                      <td key={cidx} className="py-2 px-3 text-zinc-400">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    } else if (line.trim() === "") {
      elements.push(<div key={lineNum} className="h-2" />)
      i++
    } else {
      elements.push(
        <p key={lineNum} className="text-zinc-300 leading-relaxed my-2">{line}</p>
      )
      i++
    }
  }

  return elements
}

export default function KnowledgeBaseArticle() {
  const { category, article } = useParams<{ category: string; article: string }>()
  const data = ARTICLES.find(a => a.categorySlug === category && a.slug === article)
  const categoryData = CATEGORIES.find(c => c.slug === category)
  const Icon = categoryData ? ICONS[categoryData.icon] : BookOpen
  const related = ARTICLES.filter(a => a.categorySlug === category && a.slug !== article)

  if (!data || !categoryData) {
    return (
      <div className="py-24">
        <SEO title="Article Not Found" description="The requested knowledge base article could not be found." path={`/knowledge-base/${category}/${article}`} />
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-2xl font-bold font-heading mb-4">Article not found</h1>
          <Link to="/knowledge-base" className="text-sm text-zinc-400 hover:text-zinc-200 underline underline-offset-4">
            Back to Knowledge Base
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-24">
      <SEO title={data.title} description={data.excerpt} path={`/knowledge-base/${category}/${article}`} />
      <div className="mx-auto max-w-4xl px-6">
        <Link
          to="/knowledge-base"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Knowledge Base
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
            <Icon className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <Link
              to={`/knowledge-base/${categoryData.slug}`}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider"
            >
              {categoryData.name}
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight mt-0.5">{data.title}</h1>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          {renderContent(data.content)}
        </div>

        {related.length > 0 && (
          <div className="mt-16 pt-8 border-t border-zinc-800">
            <h2 className="text-lg font-heading font-semibold mb-4">More in {categoryData.name}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((a) => (
                <Link
                  key={a.slug}
                  to={`/knowledge-base/${category}/${a.slug}`}
                  className="p-4 rounded-lg border border-zinc-800 hover:border-zinc-600 transition-colors"
                >
                  <p className="text-sm font-medium text-zinc-200">{a.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">{a.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
