import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, Cloud, Bot } from "lucide-react"
import config from "@/config.json"

const CATEGORIES = [
  { id: "minecraft", title: "Minecraft Hosting", description: "High-performance Minecraft servers with instant setup.", icon: Server, link: "/minecraft", bg: config.images?.categories?.minecraft?.background },
  { id: "vps", title: "VPS Hosting", description: "Virtual private servers with full root access.", icon: Cloud, link: "/vps", bg: config.images?.categories?.vps?.background },
  { id: "discord", title: "Discord Bot Hosting", description: "Reliable hosting for Discord bots of any size.", icon: Bot, link: "/discord-bot", bg: config.images?.categories?.discord?.background },
]

export default function SelectCategory() {
  return (
    <div className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold font-heading tracking-tight mb-4">Choose Your Service</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Select the type of hosting that fits your project.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} to={cat.link}>
              <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer h-full group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-3 group-hover:bg-accent/80 transition-colors">
                    <cat.icon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-xl">{cat.title}</CardTitle>
                  <CardDescription className="text-base">{cat.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
