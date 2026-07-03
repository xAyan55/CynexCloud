import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MemoryStick, Cpu, HardDrive, ShoppingCart } from "lucide-react"
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MINECRAFT_PRICING.map((plan) => (
            <Card key={plan.id} className={cn("card-hover border-border relative flex flex-col", plan.popular && "border-primary/50")}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 shadow-[0_0_12px_-2px_hsl(var(--primary))] px-3 py-1 text-[11px] tracking-wider">{plan.popularText || "Popular"}</Badge>
              )}
              <CardHeader>
                {plan.iconUrl && (
                  <div className="flex justify-center mb-3">
                    <img src={plan.iconUrl} alt={plan.name} className="w-16 h-16 object-contain" />
                  </div>
                )}
                <CardTitle className="text-lg text-center">{plan.name}</CardTitle>
                <div className="text-center mt-2">
                  <span className="text-3xl font-bold text-foreground">₹{plan.price}</span>
                  {plan.usdPrice && (
                    <span className="text-muted-foreground text-sm ml-2">/${plan.usdPrice}</span>
                  )}
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
                <div className="flex items-center gap-2.5 text-sm pt-1 border-t border-border mt-3">
                  <ShoppingCart className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Price:</span>
                  <span className="text-foreground font-medium ml-auto">₹{plan.price}/{plan.usdPrice && `$${plan.usdPrice}`}</span>
                </div>
              </div>
              <div className="px-6 pb-6 mt-auto">
                <Link to={`/checkout/minecraft/${plan.id}`}>
                  <Button className="w-full">Choose Plan</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
