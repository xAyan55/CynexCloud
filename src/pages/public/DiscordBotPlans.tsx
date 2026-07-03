import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { DISCORD_PRICING } from "@/constants"
import { cn } from "@/lib/utils"

export default function DiscordBotPlans() {
  return (
    <div className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold font-heading tracking-tight mb-4">Discord Bot Hosting</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Reliable hosting for your Discord bots of any size.</p>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {DISCORD_PRICING.map((plan) => (
            <Card key={plan.id} className={cn("card-hover border-border relative flex flex-col", plan.popular && "border-primary/50")}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 shadow-[0_0_12px_-2px_hsl(var(--primary))] px-3 py-1 text-[11px] tracking-wider">{plan.popularText || "Popular"}</Badge>
              )}
              {plan.discountBadge && !plan.popular && (
                <Badge variant="secondary" className="absolute -top-3 right-3">{plan.discountBadge}</Badge>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-2">
                  {plan.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through mr-2">₹{plan.originalPrice}</span>
                  )}
                  <span className="text-3xl font-bold text-foreground">₹{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">/mo</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 mb-6 flex-1">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground shrink-0" />{plan.ram} RAM
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground shrink-0" />{plan.cpu} CPU
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-foreground shrink-0" />{plan.storage}
                  </li>
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-foreground shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" disabled>Coming Soon</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
