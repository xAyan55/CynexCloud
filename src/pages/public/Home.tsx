import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Zap, Shield, Cpu, HardDrive, Globe, Headset, ArrowRight, Check, Terminal, Play, Power, AlertCircle } from "lucide-react"
import { MINECRAFT_PRICING, VPS_PRICING, DISCORD_PRICING, FAQS } from "@/constants"
import AnimatedSection from "@/components/AnimatedSection"
import { cn } from "@/lib/utils"
import config from "@/config.json"
import SEO from "@/components/SEO"

const FEATURES = [
  { icon: Zap, title: "Instant Deployment", description: "Servers are provisioned automatically the second your payment clears." },
  { icon: Shield, title: "Enterprise DDoS Protection", description: "Always-on mitigation filtering up to 12Tbps of malicious traffic." },
  { icon: Cpu, title: "AMD Ryzen 9 Power", description: "Top-tier 5.0GHz+ single-thread CPU performance for lag-free gaming." },
  { icon: HardDrive, title: "NVMe Gen4 Storage", description: "Ultra-fast read/write speeds ensuring seamless world loading." },
  { icon: Globe, title: "Anycast Global Network", description: "Strategically located data centers optimized for lowest latency." },
  { icon: Headset, title: "24/7 Expert Support", description: "Round-the-clock technical assistance from hosting professionals." },
]

export default function Home() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <SEO title="Premium Minecraft, VPS & Discord Bot Hosting" description="High-performance Minecraft server hosting, VPS, and Discord Bot hosting with Ryzen 9 processors, NVMe SSD storage, and instant setup." path="/" />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <Badge variant="outline" className="border-border/60 text-muted-foreground px-3 py-1 text-xs">
                Next-Gen Cloud Infrastructure
              </Badge>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                High-Performance <br />
                <span className="bg-gradient-to-r from-neutral-100 to-neutral-500 bg-clip-text text-transparent">
                  Hosting Solutions
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Premium AMD Ryzen™ 9 server hosting for Minecraft, high-speed VPS, and Discord bots. Engineered for zero lag, maximum uptime, and instant provisioning.
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link to="/select-category">
                  <Button size="lg" className="px-6 font-medium">
                    Deploy Server <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="outline" size="lg" className="px-6">
                    Platform Features
                  </Button>
                </Link>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-center lg:justify-start gap-2 pt-4 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>All hosting nodes operational (99.9% uptime guaranteed)</span>
              </div>
            </div>

            {/* Right Interactive Dashboard Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <Card className="w-full max-w-md border-border/80 bg-zinc-950/80 backdrop-blur-sm shadow-2xl font-mono text-[11px] overflow-hidden select-none">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-zinc-900/60">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-sans">server-console.sh</span>
                  <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                
                <div className="p-4 space-y-3.5 min-h-[220px]">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Node: node-eu-04 (Frankfurt, DE)</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-emerald-500/30 text-emerald-400 bg-emerald-950/10">Active</Badge>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">CPU Usage</span>
                      <span className="text-emerald-400">18.4%</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-1">
                      <div className="bg-emerald-500 h-1 rounded-full" style={{ width: "18.4%" }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">RAM Allocation</span>
                      <span className="text-zinc-300">4,096MB / 16,384MB</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-1">
                      <div className="bg-zinc-400 h-1 rounded-full" style={{ width: "25%" }} />
                    </div>
                  </div>

                  <div className="border-t border-border/40 pt-3 space-y-1 text-zinc-500">
                    <p className="text-emerald-500/80">&gt; cynex-provisioner --init --category=minecraft</p>
                    <p>&gt; [SYSTEM] Allocated port: 25565</p>
                    <p>&gt; [SYSTEM] Starting server on Ryzen 9 7950X...</p>
                    <p>&gt; [INFO] Server started successfully in 4.2 seconds.</p>
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-border bg-zinc-900/40 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-7 px-2.5 text-[10px] bg-zinc-950">
                      <Play className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Start
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 px-2.5 text-[10px] bg-zinc-950">
                      <Power className="w-3.5 h-3.5 mr-1.5 text-rose-500" /> Stop
                    </Button>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-sans">Ready</span>
                </div>
              </Card>
            </div>
            
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 border-b border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Enterprise Infrastructure</h2>
            <p className="text-sm text-muted-foreground">Every hosting plan comes backed by premium performance guarantees.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <Card key={i} className="border-border bg-card/40 transition-all duration-300 hover:border-border-hover hover:bg-card/80">
                <CardHeader className="p-6 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-border flex items-center justify-center mb-3">
                    <feature.icon className="w-4 h-4 text-foreground" />
                  </div>
                  <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison Tabs Section */}
      <section id="pricing" className="py-20 border-b border-border bg-zinc-950/20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Flexible Service Plans</h2>
            <p className="text-sm text-muted-foreground">Select a plan designed to grow alongside your community.</p>
          </div>

          <Tabs defaultValue="minecraft" className="w-full max-w-5xl mx-auto">
            <div className="flex justify-center mb-10">
              <TabsList className="grid w-full max-w-md grid-cols-3 bg-zinc-900 border border-border">
                <TabsTrigger value="minecraft" className="text-xs py-1.5">Minecraft</TabsTrigger>
                <TabsTrigger value="vps" className="text-xs py-1.5">VPS</TabsTrigger>
                <TabsTrigger value="discord" className="text-xs py-1.5">Discord Bot</TabsTrigger>
              </TabsList>
            </div>

            {/* Minecraft Tabs Content */}
            <TabsContent value="minecraft">
              <div className="grid md:grid-cols-3 gap-6">
                {MINECRAFT_PRICING.slice(0, 3).map((plan) => (
                  <Card key={plan.id} className={cn("border-border bg-card/35 relative flex flex-col justify-between", plan.popular && "border-neutral-700 bg-card/60")}>
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 text-[9px] tracking-wider uppercase font-semibold bg-foreground text-background">
                        Popular
                      </Badge>
                    )}
                    <CardHeader className="p-6">
                      <span className="text-xs text-muted-foreground uppercase tracking-widest">{plan.name}</span>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-bold tracking-tight">₹{plan.price}</span>
                        <span className="text-xs text-muted-foreground">/mo</span>
                      </div>
                      <CardDescription className="text-xs mt-2">{plan.description || "High-performance game instance."}</CardDescription>
                    </CardHeader>

                    <CardContent className="px-6 pb-6 pt-0 flex-1">
                      <Separator className="my-4" />
                      <ul className="space-y-2.5 text-xs text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                          <span>{plan.ram} RAM</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                          <span>{plan.cpu} CPU Allocation</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                          <span>{plan.storage} Storage</span>
                        </li>
                        {plan.features.slice(0, 2).map((feat, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <div className="p-6 pt-0">
                      <Link to={`/checkout/minecraft/${plan.id}`} className="w-full">
                        <Button className="w-full text-xs font-medium" variant={plan.popular ? "default" : "outline"}>
                          Select Plan
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* VPS Tabs Content */}
            <TabsContent value="vps">
              <div className="grid md:grid-cols-3 gap-6">
                {VPS_PRICING.slice(0, 3).map((plan) => (
                  <Card key={plan.id} className={cn("border-border bg-card/35 relative flex flex-col justify-between", plan.popular && "border-neutral-700 bg-card/60")}>
                    {plan.discountBadge && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 text-[9px] tracking-wider uppercase font-semibold bg-neutral-800 text-neutral-200">
                        {plan.discountBadge}
                      </Badge>
                    )}
                    <CardHeader className="p-6">
                      <span className="text-xs text-muted-foreground uppercase tracking-widest">{plan.name}</span>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-bold tracking-tight">₹{plan.price}</span>
                        <span className="text-xs text-muted-foreground">/mo</span>
                      </div>
                      <CardDescription className="text-xs mt-2">{plan.description || "Root access private server instance."}</CardDescription>
                    </CardHeader>

                    <CardContent className="px-6 pb-6 pt-0 flex-1">
                      <Separator className="my-4" />
                      <ul className="space-y-2.5 text-xs text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                          <span>{plan.ram} Dedicated RAM</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                          <span>{plan.cpu} Dedicated vCores</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                          <span>{plan.storage} Storage</span>
                        </li>
                        {plan.features.slice(0, 2).map((feat, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <div className="p-6 pt-0">
                      <Link to="/select-category" className="w-full">
                        <Button className="w-full text-xs font-medium" variant="outline">
                          Select Plan
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Discord Bot Tabs Content */}
            <TabsContent value="discord">
              <div className="grid md:grid-cols-3 gap-6">
                {DISCORD_PRICING.slice(0, 3).map((plan) => (
                  <Card key={plan.id} className={cn("border-border bg-card/35 relative flex flex-col justify-between", plan.popular && "border-neutral-700 bg-card/60")}>
                    {plan.discountBadge && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 text-[9px] tracking-wider uppercase font-semibold bg-neutral-800 text-neutral-200">
                        {plan.discountBadge}
                      </Badge>
                    )}
                    <CardHeader className="p-6">
                      <span className="text-xs text-muted-foreground uppercase tracking-widest">{plan.name}</span>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-bold tracking-tight">₹{plan.price}</span>
                        <span className="text-xs text-muted-foreground">/mo</span>
                      </div>
                      <CardDescription className="text-xs mt-2">{plan.description || "Reliable Discord application hosting."}</CardDescription>
                    </CardHeader>

                    <CardContent className="px-6 pb-6 pt-0 flex-1">
                      <Separator className="my-4" />
                      <ul className="space-y-2.5 text-xs text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                          <span>{plan.ram} RAM limit</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                          <span>{plan.cpu} CPU allotment</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                          <span>{plan.storage} SSD storage</span>
                        </li>
                        {plan.features.slice(0, 2).map((feat, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <div className="p-6 pt-0">
                      <Link to="/select-category" className="w-full">
                        <Button className="w-full text-xs font-medium" variant="outline">
                          Select Plan
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-12">
            <Link to="/select-category">
              <Button variant="link" className="text-xs text-muted-foreground hover:text-foreground">
                View all hardware and custom configuration options <ArrowRight className="w-3 h-3 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 border-b border-border">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground">Clear answers to help get your server running seamlessly.</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                <AccordionTrigger className="text-sm font-medium py-4 hover:no-underline">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-zinc-950/40 relative">
        <div className="mx-auto max-w-4xl px-6 text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Ready to Deploy?</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Get your server running instantly with AMD Ryzen performance. 24/7 support is always here to assist.
          </p>
          <div className="flex justify-center pt-2">
            <Link to="/select-category">
              <Button size="lg" className="px-8 font-medium">
                Get Started Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
