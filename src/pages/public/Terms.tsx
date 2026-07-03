import SEO from "@/components/SEO"

export default function Terms() {
  return (
    <div className="py-24">
      <SEO title="Terms of Service" description="Read the Terms of Service for Cynex Cloud hosting services." path="/terms" />
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-4xl font-bold font-heading tracking-tight mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>By using our services, you agree to the following terms and conditions.</p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing and using our hosting services, you accept and agree to be bound by these Terms of Service.</p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Service Description</h2>
          <p>We provide Minecraft server hosting, VPS hosting, and Discord bot hosting services. All services are provided on an "as is" basis.</p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. User Responsibilities</h2>
          <p>You are responsible for maintaining the confidentiality of your account and for all activities under your account.</p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Payments & Refunds</h2>
          <p>We offer a 72-hour money-back guarantee. Refund requests after this period are handled on a case-by-case basis.</p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Acceptable Use</h2>
          <p>You may not use our services for any illegal activities, including but not limited to: DDoS attacks, spam distribution, or hosting malicious content.</p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Limitation of Liability</h2>
          <p>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.</p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Termination</h2>
          <p>We reserve the right to terminate or suspend your account at any time for violation of these terms.</p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance.</p>
        </div>
      </div>
    </div>
  )
}
