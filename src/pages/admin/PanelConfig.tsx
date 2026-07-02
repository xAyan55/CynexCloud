import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function PanelConfig() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Panel Configuration</h1>
      <div className="space-y-6 max-w-2xl">
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">General Settings</CardTitle><CardDescription>Configure panel-wide settings.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div><Label htmlFor="site-name">Site Name</Label><Input id="site-name" defaultValue="CynexCloud" className="mt-1" /></div>
            <div><Label htmlFor="site-url">Site URL</Label><Input id="site-url" defaultValue="https://cynexcloud.com" className="mt-1" /></div>
            <Separator />
            <Button>Save Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
