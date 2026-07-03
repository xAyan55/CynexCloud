import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, MessageCircle, MapPin } from "lucide-react"
import config from "@/config.json"
import SEO from "@/components/SEO"

export default function Contact() {
  return (
    <div className="py-24">
      <SEO title="Contact Us" description="Get in touch with the Cynex Cloud team. We're here to help with any questions or issues." path="/contact" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold font-heading tracking-tight mb-4">Contact Us</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Get in touch with our team.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-foreground" />
                  <div>
                    <CardTitle className="text-sm">Email</CardTitle>
                    <CardDescription>{config.contact.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-foreground" />
                  <div>
                    <CardTitle className="text-sm">Discord</CardTitle>
                    <CardDescription>
                      <a href={config.contact.discord} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Join our server</a>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Send a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="How can we help?" className="min-h-[120px]" />
                </div>
                <Button type="submit">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
