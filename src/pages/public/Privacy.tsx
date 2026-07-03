import SEO from "@/components/SEO"

export default function Privacy() {
  return (
    <div className="py-24">
      <SEO title="Privacy Policy" description="Read the Privacy Policy for Cynex Cloud hosting services." path="/privacy" />
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-4xl font-bold font-heading tracking-tight mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-muted-foreground">
          <p>Your privacy is important to us. This policy outlines how we collect, use, and protect your information.</p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly: name, email address, and payment information when you create an account or make a purchase.</p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use your information to provide and improve our services, process payments, send technical notifications, and respond to your requests.</p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Data Security</h2>
          <p>We implement industry-standard security measures to protect your personal information from unauthorized access or disclosure.</p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Third-Party Services</h2>
          <p>We may use third-party payment processors. These providers have their own privacy policies governing your data.</p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Data Retention</h2>
          <p>We retain your personal information for as long as your account is active or as needed to provide services.</p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Your Rights</h2>
          <p>You have the right to access, update, or delete your personal information at any time through your account settings.</p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Contact</h2>
          <p>For privacy-related inquiries, please contact us at our support email.</p>
        </div>
      </div>
    </div>
  )
}
