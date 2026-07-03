import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MemoryStick, Cpu, HardDrive, ShoppingCart, Bot } from "lucide-react"
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {DISCORD_PRICING.map((plan) => (
            <Card key={plan.id} className={cn("card-hover border-border relative flex flex-col", plan.popular && "border-primary/50")}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 shadow-[0_0_12px_-2px_hsl(var(--primary))] px-3 py-1 text-[11px] tracking-wider">{plan.popularText || "Popular"}</Badge>
              )}
              {plan.discountBadge && !plan.popular && (
                <Badge variant="secondary" className="absolute -top-3 right-3 z-10">{plan.discountBadge}</Badge>
              )}
              <CardHeader>
                <div className="flex justify-center mb-3">
                  <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center">
                    <Bot className="w-8 h-8 text-accent-foreground" />
                  </div>
                </div>
                <CardTitle className="text-lg text-center">{plan.name}</CardTitle>
                <div className="text-center mt-2">
                  {plan.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through mr-2">₹{plan.originalPrice}</span>
                  )}
                  <span className="text-3xl font-bold text-foreground">₹{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">/mo</span>
                </div>
                <CardDescription className="text-center mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <div className="px-6 pb-4 space-y-2.5 flex-1">
                <div className="flex items-center gap-2.5 text-sm">
                  <MemoryStick className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Ram:</span>
                  <span className="text-foreground font-medium ml-auto">{plan.ram}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Cpu className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Cpu:</span>
                  <span className="text-foreground font-medium ml-auto">{plan.cpu}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <HardDrive className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Disk:</span>
                  <span className="text-foreground font-medium ml-auto">{plan.storage}</span>
                </div>
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm">
                    <ShoppingCart className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6 mt-auto">
                <Button className="w-full" disabled>Coming Soon</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
