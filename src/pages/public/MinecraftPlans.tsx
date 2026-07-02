import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { MINECRAFT_PRICING } from "@/constants"
import { cn } from "@/lib/utils"

export default function MinecraftPlans() {
  return (
    <div className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold font-heading tracking-tight mb-4">Minecraft Hosting Plans</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">High-performance Minecraft hosting with instant setup.</p>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {MINECRAFT_PRICING.map((plan) => (
            <Card key={plan.id} className={cn("border-border relative flex flex-col", plan.popular && "border-primary/50")}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">{plan.popularText || "Popular"}</Badge>
              )}
              <CardHeader>
                {plan.iconUrl && (
                  <img src={plan.iconUrl} alt={plan.name} className="w-12 h-12 object-contain mb-2" />
                )}
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">₹{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">/mo</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 mb-6 flex-1">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground shrink-0" />
                    {plan.ram} RAM
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground shrink-0" />
                    {plan.cpu} CPU
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground shrink-0" />
                    {plan.storage} Storage
                  </li>
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-foreground shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={`/checkout/minecraft/${plan.id}`}>
                  <Button className="w-full">Choose Plan</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
