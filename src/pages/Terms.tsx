import * as React from "react";
import { motion } from "motion/react";
import { ShieldAlert, FileText, Scale } from "lucide-react";
import config from "../config.json";

export default function Terms() {
  const lastUpdated = "June 2026";

  const sections = [
    {
      title: "1. Service Provision & Account Setup",
      content: [
        "By registering an account and purchasing any subscription or virtual resource from CYNEXCLOUD SRL ('CYNEXCLOUD', 'we', 'us', or 'our'), you agree to fully comply with these Terms of Service.",
        "To purchase services, you must be at least 13 years old or have explicit parental or guardian permission. All information provided during the setup of your account must be accurate and complete.",
        "We reserve the right to suspend or terminate accounts that contain false information, fake profile names, or are created to circumvent previous terminal closures."
      ]
    },
    {
      title: "2. Acceptable Use Policy (AUP)",
      content: [
        "CYNEXCLOUD provides game hosting, virtual servers, and bot deployment nodes. The following activities are strictly prohibited on our infrastructure:",
        "- Port scanning, DDoS launch setups, botnets, network flood scripts, or executing unauthorized network intrusion trials.",
        "- Hosting malware, Trojan packages, ransomware, phishing platforms, or cracked/pirated commercial software.",
        "- Crypocurrency mining, CPU/RAM stress tools, or processes designed to artificially spike hypervisor loads and disrupt other tenants.",
        "- Content that infringes copyrights, trademarks, patent designs, or local and international regulations."
      ]
    },
    {
      title: "3. Resource Allocation and Performance SLA",
      content: [
        "We guarantee the resource allocation (CPU cores, NVMe storage, RAM quotas) specified in your purchased tier. Your performance is backed by a 99.99% Node Uptime Service Level Agreement (SLA).",
        "In the rare event of unscheduled hardware or network failures causing continuous downtime exceeding 4 hours, customers can request SLA account credits proportional to the disruption period.",
        "Maintenance windows are scheduled during low-traffic hours and notified via email or our Discord announcement board at least 24 hours in advance."
      ]
    },
    {
      title: "4. Payments, Auto-Renewal & Refund Guidelines",
      content: [
        "All subscription plans automatically renew on the billing date (monthly, quarterly, or annually) unless a cancellation request is filed through our billing area.",
        "Refunds: We stand behind our hardware. We offer a 72-hour money-back guarantee on initial server deployments if you are unsatisfied with performance or network latency.",
        "Refund exceptions: Addon licenses, domains, dedicated servers, or accounts suspended due to Acceptable Use Policy violations are strictly non-refundable.",
        "Chargebacks: Filing a billing dispute or payment chargeback without contacting our support desk first will result in immediate suspension of all services and permanent account termination."
      ]
    },
    {
      title: "5. Backup and Data Integrity",
      content: [
        "While we capture daily automated backups of game servers, VPS Snapshots, and Bot databases to offsite storage systems, backup processes can fail.",
        "Users are ultimately responsible for maintaining their own localized backups of important database schemas, custom mod configurations, and server files using our SFTP or panel backup exporter.",
        "CYNEXCLOUD shall not be held liable for any data loss, database corruption, or financial damages resulting from hardware failures or accidental file deletions by the user."
      ]
    },
    {
      title: "6. Limitation of Liability & Indemnification",
      content: [
        "To the maximum extent permitted by applicable Romanian and EU laws, CYNEXCLOUD, its directors, and employees shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of, or inability to use, our services.",
        "You agree to indemnify and hold harmless CYNEXCLOUD against any claims, losses, damages, or legal fees arising from your hosting operations, server content, or acceptable use violations."
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
              Legal Documents
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-4 uppercase font-heading text-gradient">
              Terms Of Service
            </h1>
            <p className="text-zinc-500 text-xs sm:text-sm font-semibold uppercase tracking-wider">
              Last Updated: {lastUpdated} • CYNEXCLOUD SRL
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="container mx-auto px-6 mt-12 md:mt-20 max-w-4xl relative z-10">
        <div className="bg-zinc-950/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-12">
          
          <div className="flex items-start gap-5 border-b border-white/5 pb-8">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight mb-2 text-white font-heading">Our Agreement</h2>
              <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                Please read these terms carefully before accessing or using CYNEXCLOUD services. By deploying a server, you acknowledge that you have read, understood, and agreed to be bound by the guidelines detailed below.
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
            Have questions about our terms of service or corporate guidelines? Contact our compliance desk at{" "}
            <a href={`mailto:${config.contact.email}`} className="text-white hover:underline font-semibold">
              {config.contact.email}
            </a>
          </div>

        </div>
      </section>
    </div>
  );
}
