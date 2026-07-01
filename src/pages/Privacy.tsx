import * as React from "react";
import { motion } from "motion/react";
import { ShieldCheck, Eye, Database } from "lucide-react";
import config from "../config.json";

export default function Privacy() {
  const lastUpdated = "June 2026";

  const sections = [
    {
      title: "1. Information We Collect",
      content: [
        "To provide reliable cloud hosting services, we collect necessary user profile details. This includes:",
        "Personal Identifier Details: Full name, physical billing address, email address, phone number, and account passwords stored securely with multi-round hashing hashes.",
        "Infrastructure and Usage Logs: IP addresses used for access, login timestamps, panel navigation patterns, game server resource metrics (CPU, RAM, network bandwidth usage), and technical configurations.",
        "Billing & Transactional Metadata: Purchase dates, invoices, subscription statuses, and payment processing tokens. Note: We never store your full credit card numbers directly on our nodes; they are routed directly to PCI-DSS compliant gateways."
      ]
    },
    {
      title: "2. How We Use Your Personal Data",
      content: [
        "Your details are processed to manage infrastructure and optimize user experiences, specifically for:",
        "- Provisioning resources and configuring your games, virtual private servers, or bot accounts.",
        "- Verifying billing metrics, checking for fraud patterns, and issuing automated monthly invoices.",
        "- Troubleshooting hardware tickets and sending technical updates about scheduled maintenance.",
        "- Securing our networks from intrusion attempts, credential stuffing, and unauthorized hypervisor access."
      ]
    },
    {
      title: "3. Cookie Configurations & Local Storage",
      content: [
        "Our applications utilize small files called cookies or localized storage variables on your device to ensure core functions work properly.",
        "Functional Cookies: Used to keep your dashboard session authenticated, remember your theme choices, and track item additions in checkout.",
        "Performance Analysis: Anonymous tokens that help us evaluate layout response speeds and resolve navigation bottlenecks.",
        "You can restrict cookie storage options within your local browser preferences. However, disabling functional cookies will block authenticated access to our client areas and server panels."
      ]
    },
    {
      title: "4. Third-Party Services & Data Processors",
      content: [
        "We cooperate with reputable infrastructure and payment processors. We share data only to the minimum extent necessary to execute transactions or protect nodes. Third-party processors include:",
        "Payment Processing Gateways: Stripe, PayPal, and regional bank processors for securely handling credit or virtual transfers.",
        "Infrastructure and Security Providers: Cloudflare for edge Anycast routing and DDoS filtration; Discord for community login credentials (when requested).",
        "Verification Services: MaxMind or standard fraud-check algorithms to cross-verify billing profiles and prevent automated bot signups."
      ]
    },
    {
      title: "5. Data Storage Duration & Security Layers",
      content: [
        "All personal information is stored inside encrypted European database clusters in accordance with GDPR principles. We retain account metadata only for the duration of active service histories and the legal timeframe mandated by local taxation laws.",
        "We apply multiple physical, electronic, and managerial protections to guarantee data privacy. All server-side data lines use AES-256 encryption. Frontend sessions run exclusively on HTTPS connections with strict SSL configurations."
      ]
    },
    {
      title: "6. Your Privacy Rights (GDPR & CCPA)",
      content: [
        "Under international data regulations, you hold key controls over your data. You may request:",
        "Access to a comprehensive copy of all personal details we hold about your profile.",
        "Correction of inaccurate billing names, physical locations, or email records.",
        "Complete Deletion ('Right to be Forgotten') of your account data, provided there are no active subscriptions or pending taxation disputes.",
        "To execute any of these data rights, please submit an official data request or open a compliance ticket with our support staff."
      ]
    }
  ];

  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32 pb-16 md:pb-24 text-white">
      {/* Header Banner */}
      <section className="relative py-12 md:py-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-atmospheric opacity-20" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-4 border border-white/5 text-zinc-500 px-4 py-1 uppercase tracking-[0.4em] text-[10px] bg-zinc-950/80 rounded-full">
              Data Protection
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-4 uppercase font-heading text-gradient">
              Privacy Policy
            </h1>
            <p className="text-zinc-500 text-xs sm:text-sm font-semibold uppercase tracking-wider">
              Last Updated: {lastUpdated} • GDPR Compliant
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="container mx-auto px-6 mt-12 md:mt-20 max-w-4xl relative z-10">
        <div className="bg-zinc-950/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-12">
          
          <div className="flex items-start gap-5 border-b border-white/5 pb-8">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight mb-2 text-white font-heading">Data Transparency</h2>
              <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                At CYNEXCLOUD, we believe privacy is a fundamental standard. This policy provides complete clarity on what personal details we track, why they are processed, and the active measures we apply to protect your account metadata.
              </p>
            </div>
          </div>

          <div className="space-y-10">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white font-heading">
                  {section.title}
                </h3>
                <div className="space-y-3">
                  {section.content.map((paragraph, pIdx) => (
                    <p key={pIdx} className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-medium">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-8 mt-8 text-center text-zinc-500 text-xs font-medium leading-relaxed">
            Need additional information about our encryption algorithms or data storage locations? Contact our privacy officer at{" "}
            <a href={`mailto:${config.contact.email}`} className="text-white hover:underline font-semibold">
              {config.contact.email}
            </a>
          </div>

        </div>
      </section>
    </div>
  );
}
