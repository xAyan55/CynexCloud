import * as React from "react";
import { useState } from "react";
import { motion } from "motion/react";
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  MapPin, 
  Send, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import config from "../config.json";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "support",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        subject: "support",
        message: ""
      });
    }, 1200);
  };

  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32 pb-16 md:pb-24 text-white">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-atmospheric opacity-40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-6 border border-white/5 text-zinc-500 px-5 py-1.5 uppercase tracking-[0.4em] text-[10px] bg-zinc-950/80 rounded-full">
              Get In Touch
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-8xl font-black tracking-tighter mb-6 md:mb-8 max-w-4xl mx-auto leading-none md:leading-tight uppercase font-heading text-gradient">
              WE ARE HERE TO <span className="text-zinc-600 italic font-thin">HELP</span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-12 font-medium leading-relaxed">
              Have a pre-sales question? Want to discuss a custom enterprise configuration? Choose any support channel below or drop us a line directly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Info & Form Section */}
      <section className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Support Channels */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-white font-heading">
              SUPPORT CHANNELS
            </h2>

            <div className="bg-zinc-950/40 border border-white/5 rounded-3xl p-6 flex gap-5 items-start">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight mb-1 text-white font-heading">Discord Server</h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-3">
                  Join our official Discord community for live chat, instant configuration assistance, and general community discussions.
                </p>
                <a 
                  href={config.contact.discord} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-widest font-black text-white hover:underline inline-flex items-center gap-1.5"
                >
                  Join Discord Server →
                </a>
              </div>
            </div>

            <div className="bg-zinc-950/40 border border-white/5 rounded-3xl p-6 flex gap-5 items-start">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight mb-1 text-white font-heading">Email Channels</h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-1">
                  General inquiries: <span className="text-white font-semibold">{config.contact.email}</span>
                </p>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Billing and Accounts: <span className="text-white font-semibold">billing@cynexcloud.eu.cc</span>
                </p>
              </div>
            </div>

            <div className="bg-zinc-950/40 border border-white/5 rounded-3xl p-6 flex gap-5 items-start">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight mb-1 text-white font-heading">Operating Hours</h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-1">
                  Server monitoring: <span className="text-white font-semibold">24/7/365</span>
                </p>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Technical support ticket response: <span className="text-white font-semibold">Under 15 Minutes</span>
                </p>
              </div>
            </div>

            <div className="bg-zinc-950/40 border border-white/5 rounded-3xl p-6 flex gap-5 items-start">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight mb-1 text-white font-heading">Headquarters</h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  CYNEXCLOUD Hosting Solutions SRL<br />
                  Bucharest, Romania
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-950/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-white font-heading">
                SEND MESSAGE
              </h2>

              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2 font-heading">Message Dispatched</h3>
                  <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
                    Thank you! Your message has been routed to our support team. We generally respond to contact form submissions within 1 hour.
                  </p>
                  <Button 
                    onClick={() => setSubmitted(false)}
                    className="bg-white text-black hover:bg-zinc-200 uppercase font-black tracking-widest text-[10px]"
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 text-sm dashboard-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Your Email</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 text-sm dashboard-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Subject Department</label>
                    <select 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 text-sm dashboard-input appearance-none"
                    >
                      <option value="support">Pre-sales & General Information</option>
                      <option value="billing">Billing and Refunds</option>
                      <option value="enterprise">Enterprise Configurations</option>
                      <option value="partnership">Sponsorships & Partnerships</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Message Content</label>
                    <textarea 
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we assist you with your hosting requirements?"
                      className="w-full px-4 py-3 text-sm dashboard-input resize-none"
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-white text-black hover:bg-zinc-200 h-12 font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Dispatch Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
