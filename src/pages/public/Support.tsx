import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, MessageCircle } from "lucide-react"
import { FAQS } from "@/constants"
import config from "@/config.json"
import SEO from "@/components/SEO"

export default function Support() {
  return (
    <div className="py-24">
      <SEO title="Support" description="Get help 24/7 via email, Discord, or our contact form. Browse our FAQ for quick answers." path="/support" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold font-heading tracking-tight mb-4">Support</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">We're here to help you 24/7.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
          <Card className="border-border">
            <CardHeader>
              <Mail className="w-8 h-8 text-foreground mb-2" />
              <CardTitle className="text-base">Email Us</CardTitle>
              <CardDescription>
                Reach our support team directly via email. We typically respond within 24 hours.
              </CardDescription>
              <CardDescription className="text-sm font-medium text-foreground pt-2">{config.contact.email}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-border">
            <CardHeader>
              <MessageCircle className="w-8 h-8 text-foreground mb-2" />
              <CardTitle className="text-base">Discord</CardTitle>
              <CardDescription>
                Join our community server for real-time help, updates, and discussions.
              </CardDescription>
              <CardDescription className="pt-2">
                <a href={config.contact.discord} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline">Join our Discord &rarr;</a>
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-border">
            <CardHeader className="flex flex-col gap-4">
              <CardTitle className="text-base">Contact Form</CardTitle>
              <CardDescription asChild>
                <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Describe your issue..." className="mt-1" />
                  </div>
                  <Button type="submit">Send Message</Button>
                </form>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold font-heading tracking-tight mb-8 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
