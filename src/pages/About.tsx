import * as React from "react";
import { motion } from "motion/react";
import { 
  Users, 
  Target, 
  Award, 
  Shield, 
  Clock, 
  Heart,
  Cpu,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import config from "../config.json";

export default function About() {
  const navigate = useNavigate();

  const metrics = [
    { label: "Active Servers", value: "15,000+", desc: "Instances running worldwide" },
    { label: "Global Locations", value: "8 Node Sites", desc: "Premium tier-1 datacenter locations" },
    { label: "Support Resolution", value: "<15 Min", desc: "Average response time on tickets" },
    { label: "Uptime SLA", value: "99.99%", desc: "Guaranteed network and power stability" }
  ];

  const values = [
    {
      icon: <Shield className="w-6 h-6 text-white" />,
      title: "Security First",
      description: "Everything we build puts safety first. With enterprise-grade 12Tbps+ DDoS mitigation, we handle attacks before they even reach your instance."
    },
    {
      icon: <Cpu className="w-6 h-6 text-white" />,
      title: "No Overselling",
      description: "Unlike standard hosts, we allocate 100% dedicated hardware. Your server gets dedicated CPU threads, actual RAM allotments, and premium NVMe IOPS."
    },
    {
      icon: <Clock className="w-6 h-6 text-white" />,
      title: "Always Online Support",
      description: "Our systems are supported 24/7/365 by actual developers. We are ready to help with mod configurations, custom panel actions, and networking issues."
    },
    {
      icon: <Globe className="w-6 h-6 text-white" />,
      title: "Global Grid Network",
      description: "Strategically distributed Anycast endpoints ensure maximum transfer rates and sub-15ms regional latency for players across the world."
    }
  ];

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
              Who We Are
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-8xl font-black tracking-tighter mb-6 md:mb-8 max-w-4xl mx-auto leading-none md:leading-tight uppercase font-heading text-gradient">
              THE FUTURE OF <span className="text-zinc-600 italic font-thin">HOSTING</span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-12 font-medium leading-relaxed">
              We started {config.brand.name} with a simple goal: to build a hosting solution we actually wanted to use. No marketing hype, no artificial resource limits, just pure, uncompromised performance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="container mx-auto px-6 mb-20 md:mb-32 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, idx) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-zinc-950/40 border border-white/5 rounded-3xl p-8 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block mb-2">{m.label}</span>
                <h3 className="text-3xl sm:text-4xl font-black font-heading text-white">{m.value}</h3>
              </div>
              <p className="text-zinc-500 text-xs mt-4 font-medium">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Vision and Mission */}
      <section className="container mx-auto px-6 mb-20 md:mb-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-zinc-950/60 rounded-[2.5rem] p-8 md:p-12 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-4 text-white font-heading">Our Mission</h2>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
              To provide developers, gamers, and enterprises with low-latency, resilient cloud infrastructure. We believe high-performance hosting shouldn&apos;t be restricted by excessive pricing, complex portals, or unreliable support. By continually upgrading our global Anycast grids and utilizing cutting-edge CPU hardware, we ensure your online projects run seamlessly round-the-clock.
            </p>
          </div>

          <div className="bg-zinc-950/60 rounded-[2.5rem] p-8 md:p-12 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-4 text-white font-heading">Our Vision</h2>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
              We envision a fully connected, low-latency web where setting up servers is an instantaneous, fluid experience. We are creating an environment where deploying complex game servers, bot configurations, and secure virtual private environments requires only a single click—backed by enterprise SLA standards and the most resilient network grid in the industry.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="container mx-auto px-6 mb-20 md:mb-32 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-4 border border-white/5 text-zinc-500 px-4 py-1.5 uppercase tracking-[0.4em] text-[10px] bg-zinc-950/80 rounded-full">
            What Drives Us
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-heading">Our Core Values</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {values.map((v, idx) => (
            <div 
              key={v.title}
              className="group rounded-[2rem] border border-white/5 bg-zinc-950/40 p-6 sm:p-8 flex gap-6 items-start transition-all duration-500 hover:border-white/10 hover:bg-zinc-900/40"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-all">
                {v.icon}
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-white font-heading">
                  {v.title}
                </h3>
                <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed font-medium">
                  {v.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-6 text-center">
        <h2 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight mb-6 md:mb-8 uppercase font-heading">
          EXPERIENCE NEXT-LEVEL HOSTING
        </h2>
        <Button 
          size="lg" 
          onClick={() => navigate("/select-category")}
          className="bg-white text-black hover:bg-zinc-200 text-[10px] sm:text-xs px-8 sm:px-10 h-12 sm:h-14 font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.15)]"
        >
          Select Your Plan Now
        </Button>
      </section>
    </div>
  );
}
