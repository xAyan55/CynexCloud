import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Zap, ShieldCheck, Cpu, Server, Globe, Headset, ArrowRight, Check } from "lucide-react"
import { MINECRAFT_PRICING, FAQS } from "@/constants"
import AnimatedSection from "@/components/AnimatedSection"
import { cn } from "@/lib/utils"
import config from "@/config.json"

const FEATURES = [
  { icon: Zap, title: "Instant Provisioning", description: "Your server is deployed the microsecond your transaction clears." },
  { icon: ShieldCheck, title: "DDoS Mitigation", description: "Multi-layered protection filtering malicious traffic." },
  { icon: Cpu, title: "Ryzen 9 Performance", description: "Powered by latest AMD Ryzen 9 processors." },
  { icon: Server, title: "NVMe Storage", description: "RAID-10 NVMe SSDs for lightning-fast performance." },
  { icon: Globe, title: "Global Network", description: "Data centers in NA, EU, and Asia-Pacific." },
  { icon: Headset, title: "24/7 Support", description: "Expert support engineers always available." },
]

export default function Home() {
  return (
    <div>
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-xs text-muted-foreground">
                Premium High-Performance Hosting
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold font-heading tracking-tight mb-6">
                Power Your Projects<br />with{" "}
                <span className="text-foreground">{config.brand.name}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mb-10">
                {config.brand.description}
              </p>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <Link to="/select-category">
                  <Button size="lg">
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="outline" size="lg">View Features</Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center md:justify-end">
              <img
                src="/images/main-imgs/mc-char.png"
                alt="Minecraft character"
                className="w-full max-w-md h-auto object-contain drop-shadow-2xl"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      <AnimatedSection>
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-heading tracking-tight mb-4">Why Choose Us</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Enterprise infrastructure with consumer-friendly pricing.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {FEATURES.map((feature) => (
                <Card key={feature.title} className="card-hover border-border transition-colors duration-300 hover:border-zinc-600">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-2">
                      <feature.icon className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delay={100}>
        <section id="pricing" className="py-20 bg-card/50">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-heading tracking-tight mb-4">Simple Pricing</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Choose the plan that fits your needs.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {MINECRAFT_PRICING.slice(0, 3).map((plan) => (
                <Card key={plan.id} className={cn("card-hover border-border relative", plan.popular && "border-primary/50")}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 shadow-[0_0_12px_-2px_hsl(var(--primary))] px-3 py-1 text-[11px] tracking-wider">{plan.popularText || "Popular"}</Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-foreground">₹{plan.price}</span>
                      <span className="text-muted-foreground text-sm ml-1">/mo</span>
                    </div>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-foreground" />
                          {f}
                        </li>
                      ))}
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-foreground" />
                        {plan.ram} RAM
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-foreground" />
                        {plan.storage} Storage
                      </li>
                    </ul>
                    <Link to={`/checkout/minecraft/${plan.id}`}>
                      <Button className="w-full">Choose Plan</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/minecraft">
                <Button variant="outline">View All Plans</Button>
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delay={200}>
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-heading tracking-tight mb-4">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delay={300}>
        <section className="py-20 bg-card/50">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="text-3xl font-bold font-heading tracking-tight mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Deploy your server in seconds and experience the difference.</p>
            <Link to="/select-category">
              <Button size="lg">Deploy Now <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        </section>
      </AnimatedSection>
    </div>
  )
}
