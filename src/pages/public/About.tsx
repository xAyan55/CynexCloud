import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Shield, Headset } from "lucide-react"
import config from "@/config.json"
import SEO from "@/components/SEO"

const VALUES = [
  { icon: Zap, title: "Performance First", description: "We use only the best hardware—AMD Ryzen 9, NVMe storage—so your services run at peak performance." },
  { icon: Shield, title: "Reliability", description: "Our infrastructure is built for 99.9% uptime with redundant systems and automated failover." },
  { icon: Headset, title: "Customer Focused", description: "We believe in providing enterprise-level support to every customer, regardless of plan size." },
]

export default function About() {
  return (
    <div className="py-24">
      <SEO title="About Us" description="Learn about Cynex Cloud — premium hosting powered by cutting-edge hardware and a passionate team." path="/about" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold font-heading tracking-tight mb-6">About {config.brand.name}{config.brand.suffix}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{config.brand.description}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {VALUES.map((v) => (
            <Card key={v.title} className="border-border">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-2">
                  <v.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <CardTitle className="text-base">{v.title}</CardTitle>
                <CardDescription>{v.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
