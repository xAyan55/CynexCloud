import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface Settings {
  pterodactyl_url: string
  pterodactyl_app_key: string
  pterodactyl_client_key: string
  oxapay_merchant_key: string
  social_login_provider: string
  discord_client_id: string
  discord_client_secret: string
}

export default function PanelConfig() {
  const { authFetch } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [settings, setSettings] = useState<Settings>({
    pterodactyl_url: "",
    pterodactyl_app_key: "",
    pterodactyl_client_key: "",
    oxapay_merchant_key: "",
    social_login_provider: "none",
    discord_client_id: "",
    discord_client_secret: ""
  })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await authFetch("/api/admin/settings")
        const data = await res.json()
        if (data.success && data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }))
        }
      } catch {
        setError("Failed to load settings")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [authFetch])

  const handleSave = async () => {
    setError("")
    setSuccess("")
    setSaving(true)
    try {
      const res = await authFetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      })
      const data = await res.json()
      if (data.success) {
        setSuccess("Settings saved successfully.")
      } else {
        setError(data.error || "Failed to save settings")
      }
    } catch {
      setError("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading tracking-tight mb-6">Panel Configuration</h1>
      <div className="space-y-6 max-w-2xl">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Pterodactyl Panel</CardTitle>
            <CardDescription>Configure Pterodactyl API connection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pterodactyl_url">Panel URL</Label>
              <Input id="pterodactyl_url" placeholder="https://panel.yourdomain.com" className="mt-1.5" value={settings.pterodactyl_url} onChange={e => setSettings(prev => ({ ...prev, pterodactyl_url: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="pterodactyl_app_key">Application API Key</Label>
              <Input id="pterodactyl_app_key" type="password" placeholder="ptla_..." className="mt-1.5" value={settings.pterodactyl_app_key} onChange={e => setSettings(prev => ({ ...prev, pterodactyl_app_key: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="pterodactyl_client_key">Client API Key</Label>
              <Input id="pterodactyl_client_key" type="password" placeholder="ptlc_..." className="mt-1.5" value={settings.pterodactyl_client_key} onChange={e => setSettings(prev => ({ ...prev, pterodactyl_client_key: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Payment Gateway</CardTitle>
            <CardDescription>Configure OxaPay cryptocurrency gateway.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="oxapay_merchant_key">OxaPay Merchant Key</Label>
              <Input id="oxapay_merchant_key" type="password" placeholder="Enter OxaPay merchant key" className="mt-1.5" value={settings.oxapay_merchant_key} onChange={e => setSettings(prev => ({ ...prev, oxapay_merchant_key: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Social Login</CardTitle>
            <CardDescription>Configure social login options for authentication.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="social_login_provider">Login Provider</Label>
              <Select value={settings.social_login_provider} onValueChange={val => setSettings(prev => ({ ...prev, social_login_provider: val }))}>
                <SelectTrigger id="social_login_provider" className="mt-1.5">
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Disabled</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="both">Discord + Google</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(settings.social_login_provider === "discord" || settings.social_login_provider === "both") && (
              <>
                <Separator />
                <div>
                  <Label htmlFor="discord_client_id">Discord Client ID</Label>
                  <Input id="discord_client_id" placeholder="Enter Discord application client ID" className="mt-1.5" value={settings.discord_client_id} onChange={e => setSettings(prev => ({ ...prev, discord_client_id: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="discord_client_secret">Discord Client Secret</Label>
                  <Input id="discord_client_secret" type="password" placeholder="Enter Discord client secret" className="mt-1.5" value={settings.discord_client_secret} onChange={e => setSettings(prev => ({ ...prev, discord_client_secret: e.target.value }))} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Settings</>}
          </Button>
        </div>
      </div>
    </div>
  )
}
