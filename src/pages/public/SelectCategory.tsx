import { Link } from "react-router-dom"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SEO from "@/components/SEO"

const CATEGORIES = [
  { id: "minecraft", title: "Minecraft Hosting", description: "High-performance Minecraft servers with instant setup.", img: "/images/sec-imgs/mc-sec.png", link: "/minecraft" },
  { id: "vps", title: "VPS Hosting", description: "Virtual private servers with full root access.", img: "/images/sec-imgs/vps-sec.png", link: "/vps" },
  { id: "discord", title: "Discord Bot Hosting", description: "Reliable hosting for Discord bots of any size.", img: "/images/sec-imgs/bot-sec.png", link: "/discord-bot" },
]

export default function SelectCategory() {
  return (
    <div className="py-24">
      <SEO title="Select Your Hosting Plan" description="Choose from Minecraft server hosting, VPS servers, or Discord Bot hosting plans tailored to your needs." path="/select-category" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold font-heading tracking-tight mb-4">Choose Your Service</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Select the type of hosting that fits your project.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} to={cat.link}>
              <Card className="card-hover border-border hover:border-primary/50 transition-colors cursor-pointer h-full group overflow-hidden">
                <CardHeader>
                  <div className="mb-4 -mx-6 -mt-6 overflow-hidden">
                    <img src={cat.img} alt={cat.title} className="w-full h-40 object-cover" />
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
