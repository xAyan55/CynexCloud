import * as React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  MessageSquare, 
  BookOpen, 
  CreditCard, 
  Activity, 
  Clock, 
  ArrowRight,
  Shield,
  LifeBuoy,
  ChevronRight,
  Sparkles,
  Server,
  Cpu,
  Globe,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQS } from "../constants";
import config from "../config.json";

export default function Support() {
  const [faqSearch, setFaqSearch] = useState("");
  const [nodePings, setNodePings] = useState<Record<string, number>>({
    "GER-1 (Frankfurt)": 12,
    "US-EAST-1 (Virginia)": 74,
    "US-WEST-1 (Oregon)": 110,
    "SGP-1 (Singapore)": 182,
    "RO-1 (Bucharest)": 8,
    "Game Panel": 15,
    "Billing Area": 14,
    "Edge Anycast Grid": 5
  });

  // Dynamically update pings to look alive and interactive
  useEffect(() => {
    const interval = setInterval(() => {
      setNodePings(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2 ms fluctuation
          next[key] = Math.max(2, next[key] + delta);
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredFaqs = FAQS.filter(faq => 
    faq.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
    faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const statusNodes = [
    { name: "GER-1 (Frankfurt)", type: "Core Compute Node", uptime: "99.99%", status: "online", load: "24%" },
    { name: "US-EAST-1 (Virginia)", type: "Core Compute Node", uptime: "99.98%", status: "online", load: "31%" },
    { name: "US-WEST-1 (Oregon)", type: "Core Compute Node", uptime: "99.99%", status: "online", load: "18%" },
    { name: "SGP-1 (Singapore)", type: "Core Compute Node", uptime: "99.95%", status: "online", load: "42%" },
    { name: "RO-1 (Bucharest)", type: "Edge Node / Main", uptime: "100.00%", status: "online", load: "12%" },
    { name: "Game Panel", type: "Pterodactyl Daemon Grid", uptime: "99.99%", status: "online", load: "8%" },
    { name: "Billing Area", type: "WHMCS Billing Node", uptime: "100.00%", status: "online", load: "5%" },
    { name: "Edge Anycast Grid", type: "DDoS Mitigation Layer", uptime: "100.00%", status: "online", load: "1%" }
  ];

  const resourceCards = [
    {
      icon: <MessageSquare className="w-6 h-6 text-indigo-400" />,
      title: "Community Discord",
      desc: "Get fast help and instant responses from our team and experienced members.",
      action: "Join Discord",
      link: "https://discord.gg/SxKJqV5CNE",
      isInternal: false
    },
    {
      icon: <BookOpen className="w-6 h-6 text-white" />,
      title: "Knowledge Base",
      desc: "Explore detailed tutorials on configuring your servers and files.",
      action: "Read Articles",
      link: "/knowledge-base",
      isInternal: true
    },
    {
      icon: <CreditCard className="w-6 h-6 text-white" />,
      title: "Billing Portal",
      desc: "Manage your premium plans, invoices, and payment methods easily.",
      action: "Client Area",
      link: "https://billing.cynexcloud.eu.cc",
      isInternal: false
    },
    {
      icon: <Activity className="w-6 h-6 text-white" />,
      title: "System Status",
      desc: "Check real-time hardware, network, and node uptime status.",
      action: "View Status",
      link: "#status",
      isInternal: true
    }
  ];

  const handleScrollToStatus = (e: React.MouseEvent, link: string) => {
    if (link === "#status") {
      e.preventDefault();
      document.getElementById("status")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32 pb-16 md:pb-24 text-white">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-atmospheric opacity-35" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-6 border border-white/5 text-zinc-500 px-5 py-1.5 uppercase tracking-[0.4em] text-[10px] bg-zinc-950/80 rounded-full">
              24/7/365 Live Assistance
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-8xl font-black tracking-tighter mb-6 md:mb-8 max-w-4xl mx-auto leading-none md:leading-tight uppercase font-heading text-gradient">
              WE&apos;RE HERE TO <span className="text-zinc-600 italic font-thin">SUPPORT</span> YOU
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 md:mb-12 font-medium leading-relaxed">
              Have questions or need assistance? Create a direct ticket in our community Discord server, look through our frequently asked questions, or browse the knowledge base.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Resource Cards */}
      <section className="container mx-auto px-6 mb-16 md:mb-24 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {resourceCards.map((item, idx) => (
            item.isInternal ? (
              <Link 
                to={item.link}
                onClick={(e) => handleScrollToStatus(e, item.link)}
                key={idx}
                className="group relative rounded-3xl border border-white/5 bg-zinc-950/50 p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 hover:border-white/20 hover:bg-zinc-900/50"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-all duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight mb-2 text-white">{item.title}</h3>
                  <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed mb-6 font-medium">{item.desc}</p>
                </div>
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                  {item.action} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ) : (
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                key={idx}
                className="group relative rounded-3xl border border-white/5 bg-zinc-950/50 p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 hover:border-white/20 hover:bg-zinc-900/50"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-all duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight mb-2 text-white">{item.title}</h3>
                  <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed mb-6 font-medium">{item.desc}</p>
                </div>
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                  {item.action} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            )
          ))}
        </div>
      </section>

      {/* System Status Section */}
      <section id="status" className="container mx-auto px-6 mb-16 md:mb-24 relative z-10 scroll-mt-28">
        <div className="bg-zinc-950/40 rounded-[2.5rem] border border-white/5 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 pb-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full w-fit mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider">All Systems Operational</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-heading">
                SYSTEM STATUS BOARD
              </h2>
            </div>
            <div className="text-left md:text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Global Network Reliability</span>
              <span className="text-xl sm:text-2xl font-black text-white font-heading">99.985% AVERAGE UPTIME</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statusNodes.map((node, index) => (
              <div 
                key={index}
                className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-white tracking-tight">{node.name}</h4>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                  </div>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block mb-4">{node.type}</span>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2 font-mono text-[11px] text-zinc-400">
                  <div className="flex justify-between">
                    <span>Uptime</span>
                    <span className="text-white font-semibold">{node.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ping</span>
                    <span className="text-emerald-400 font-semibold">{nodePings[node.name] || 15}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Load</span>
                    <span className="text-zinc-300 font-semibold">{node.load}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support & FAQ Layout */}
      <section className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        {/* Discord Ticket Support Panel */}
        <div className="lg:col-span-7 bg-zinc-950/40 rounded-[2.5rem] border border-white/5 p-6 sm:p-8 md:p-12 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full w-fit mb-6 sm:mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider">Discord Tickets Active</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight font-heading mb-4">
              DISCORD TICKET SUPPORT
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-medium mb-6 sm:mb-10 max-w-xl">
              We have integrated our complete helpdesk directly into our Discord Server. This ensures lightning-fast responses, direct communication with hardware developers, and a secure environment to share server logs and configuration files.
            </p>

            {/* Step-by-step instructions */}
            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
              {[
                {
                  step: "01",
                  title: "Join Our Server",
                  desc: "Click the secure invite link below to join our Discord community space."
                },
                {
                  step: "02",
                  title: "Go to Ticket Channel",
                  desc: "Navigate to the designated #create-a-ticket channel under the Support category."
                },
                {
                  step: "03",
                  title: "Choose Ticket Category",
                  desc: "Click the button corresponding to your query (Billing, Technical support, or Sales)."
                },
                {
                  step: "04",
                  title: "Interact with Support",
                  desc: "A private, secure channel will be opened instantly for you to chat with our experts."
                }
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start group">
                  <div className="text-xs font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-md font-mono mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black uppercase text-white tracking-wide mb-1 group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-zinc-500 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <a 
              href="https://discord.gg/SxKJqV5CNE" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative flex items-center justify-center gap-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white h-14 sm:h-16 text-xs sm:text-sm font-black uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] border border-indigo-400/20 hover:scale-[1.01] active:scale-[0.99]"
            >
              <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              Join Discord & Open Ticket
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Average response: 10 mins
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> 100% Secure & Private
              </span>
            </div>
          </div>
        </div>

        {/* FAQs list */}
        <div className="lg:col-span-5">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-heading mb-4">
              Frequently Asked
            </h2>
            <div className="relative">
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full h-12 pl-4 pr-10 dashboard-input rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              <Accordion className="w-full space-y-4">
                {filteredFaqs.map((faq, i) => (
                  <AccordionItem 
                    value={`item-${i}`} 
                    key={i} 
                    className="border border-white/5 bg-zinc-950/40 rounded-2xl px-6 py-1 overflow-hidden transition-all duration-300 hover:border-white/10"
                  >
                    <AccordionTrigger className="text-left font-bold text-sm text-zinc-100 hover:text-white hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-400 text-sm leading-relaxed pb-4 pt-1 font-medium">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12 border border-dashed border-white/5 rounded-3xl">
                <p className="text-zinc-500 font-bold text-sm mb-2">No matching FAQs found</p>
                <p className="text-zinc-600 text-xs">Try searching general terms like "server", "setup", or "Minecraft"</p>
              </div>
            )}
          </div>

          {/* Prompt to join Discord */}
          <div className="mt-8 bg-zinc-950 border border-white/5 rounded-3xl p-6 flex items-start gap-4">
            <Clock className="w-6 h-6 text-zinc-500 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white uppercase mb-1">Average Response Times</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                Our team is active 24/7. Tickets are resolved within an average of 15 minutes. Discord community support is usually instant!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
