import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Server, Cloud, Bot, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export default function Deploy() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading tracking-tight">Deploy Server</h1>
        <p className="text-muted-foreground mt-1">Choose a service type to deploy.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: Server, title: "Minecraft", desc: "Deploy a Minecraft server", link: "/minecraft" },
          { icon: Cloud, title: "VPS", desc: "Deploy a virtual server", link: "/vps" },
          { icon: Bot, title: "Discord Bot", desc: "Host a Discord bot", link: "/discord-bot" },
        ].map((item) => (
          <Link key={item.title} to={item.link}>
            <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-3">
                  <item.icon className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Select <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
