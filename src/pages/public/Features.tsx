import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FEATURE_DESCRIPTIONS } from "@/featureDescriptions"
import { Check } from "lucide-react"
import SEO from "@/components/SEO"

export default function Features() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const features = Object.entries(FEATURE_DESCRIPTIONS)

  return (
    <div className="py-24">
      <SEO title="Features" description="Discover the powerful features of Cynex Cloud — Ryzen 9 nodes, NVMe storage, DDoS protection, instant provisioning, and 24/7 support." path="/features" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold font-heading tracking-tight mb-4">All Features</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Click any feature for more details.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(([name, description]) => {
            const isExpanded = expanded === name
            return (
              <Card
                key={name}
                className="border-border cursor-pointer transition-all duration-300 hover:border-foreground/30"
                onClick={() => setExpanded(isExpanded ? null : name)}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base mb-1">{name}</CardTitle>
                      <CardDescription>{description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-96 opacity-100 pt-0' : 'max-h-0 opacity-0 p-0'}`}>
                  <p className="text-sm text-muted-foreground border-t border-border pt-4">
                    <span className="font-medium text-foreground">{name}</span> is included in all applicable plans. Contact our support team if you have questions about how this feature works with your specific setup.
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
