import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FEATURE_DESCRIPTIONS } from "@/featureDescriptions"
import { Check } from "lucide-react"

export default function Features() {
  const features = Object.entries(FEATURE_DESCRIPTIONS)
  return (
    <div className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold font-heading tracking-tight mb-4">All Features</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to run your services.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(([name, description]) => (
            <Card key={name} className="border-border">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
                  <div>
                    <CardTitle className="text-base mb-1">{name}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
