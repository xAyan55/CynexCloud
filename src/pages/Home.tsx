import * as React from "react";
import { motion } from "motion/react";
import { 
  ChevronRight, 
  Server
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "../components/CustomBadge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MINECRAFT_FEATURES, MINECRAFT_PRICING, VPS_PRICING, DISCORD_PRICING, FAQS } from "../constants";
import PricingSection from "../components/PricingSection";
import config from "../config.json";

export default function Home() {
  const navigate = useNavigate();
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  const featuredPlans = [
    MINECRAFT_PRICING.find(p => p.name.toLowerCase().includes('creeper')) || MINECRAFT_PRICING[0],
    VPS_PRICING.find(p => p.popular) || VPS_PRICING[0],
    DISCORD_PRICING.find(p => p.popular) || DISCORD_PRICING[0]
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen md:h-[110vh] flex items-center justify-center overflow-hidden pt-24 pb-16 md:py-0 bg-black">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-atmospheric opacity-60" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_50%)] blur-[100px]" 
          />

          <img 
            src={config.images.heroBackground} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-20 filter grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center mt-10 md:mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-6 md:mb-8 border-white/5 text-zinc-500 px-5 py-1.5 uppercase tracking-[0.4em] text-[10px] glass-dark shadow-2xl">
              Next-Gen {config.brand.suffix} Solutions
            </Badge>
            <h1 className="text-4xl sm:text-6xl md:text-[140px] font-black tracking-tighter mb-6 md:mb-8 max-w-6xl mx-auto leading-none md:leading-[0.82] uppercase font-heading text-gradient">
              UNLEASH YOUR <span className="text-zinc-700 italic font-thin">CREATIVITY</span> WITHOUT LIMITS
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base md:text-xl max-w-2xl mx-auto mb-10 md:mb-12 font-medium leading-relaxed">
              High-performance servers, instant setup, and 24/7 expert support. 
              The ultimate hosting experience for your digital community.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
              <Button 
                size="lg" 
                onClick={() => navigate("/select-category")}
                className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 text-xs sm:text-sm px-8 sm:px-12 h-14 sm:h-16 font-black uppercase tracking-widest group hover:scale-105 active:scale-95 transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                View Plans <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-500" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full sm:w-auto border-white/10 text-white hover:bg-white/5 text-xs sm:text-sm px-8 sm:px-12 h-14 sm:h-16 font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-500 glass"
              >
                Explore Features
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 text-zinc-500 hidden sm:block"
        >
          <div className="w-6 h-10 border-2 border-zinc-700 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-zinc-500 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-32 border-y border-white/5 bg-zinc-950/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-atmospheric opacity-30" />
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 relative z-10">
          {[
            { label: "Active Servers", value: "15,000+" },
            { label: "Uptime", value: "99.99%" },
            { label: "Support Response", value: "< 15m" },
            { label: "Data Centers", value: "12" },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center group"
            >
              <div className="text-4xl md:text-5xl font-black mb-3 font-heading group-hover:text-glow transition-all duration-500 text-gradient">{stat.value}</div>
              <div className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-40 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 -left-24 w-[500px] h-[500px] bg-white/5 blur-[150px] rounded-full" />
          <div className="absolute bottom-1/4 -right-24 w-[500px] h-[500px] bg-white/5 blur-[150px] rounded-full" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-32 gap-6 md:gap-10"
          >
            <div className="max-w-4xl">
              <Badge variant="outline" className="mb-6 border-white/5 text-zinc-600 px-4 py-1 uppercase tracking-[0.4em] text-[10px] glass-dark">
                Performance First
              </Badge>
              <h2 className="text-3xl sm:text-5xl md:text-9xl font-black tracking-tighter leading-none md:leading-[0.82] uppercase font-heading text-gradient">
                Engineered for <br />
                <span className="text-zinc-700 italic font-thin">Peak Performance</span>
              </h2>
            </div>
            <p className="text-zinc-600 max-w-sm text-sm sm:text-base leading-relaxed font-medium">
              Our infrastructure is purpose-built for high-demand applications, utilizing enterprise-grade hardware and a global low-latency network.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:auto-rows-[280px] auto-rows-auto">
            {MINECRAFT_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onMouseMove={handleMouseMove}
                className={`group relative rounded-[2.5rem] border border-white/5 bg-zinc-950/50 p-6 sm:p-10 overflow-hidden flex flex-col justify-between transition-all duration-700 hover:border-white/20 hover:bg-zinc-900/50 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] ${
                  feature.size === "large" ? "md:col-span-4 md:row-span-2" : 
                  feature.size === "medium" ? "md:col-span-3 md:row-span-1" : 
                  "md:col-span-2 md:row-span-1"
                }`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(255,255,255,0.08)_0%,transparent_50%)]" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 sm:mb-10 group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-700 relative overflow-hidden shadow-2xl">
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.4, 1],
                        opacity: [0, 0.3, 0] 
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut" 
                      }}
                      className="absolute inset-0 bg-white blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="relative z-10 transition-colors duration-700">
                      {React.cloneElement(feature.icon as React.ReactElement, { 
                        size: 28,
                        className: "w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:text-black transition-colors duration-700"
                      })}
                    </div>
                  </div>
                  <h3 className={`font-black tracking-tighter mb-4 text-white uppercase font-heading ${feature.size === "large" ? "text-3xl sm:text-5xl" : "text-xl sm:text-2xl"}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-zinc-500 leading-relaxed font-medium ${feature.size === "large" ? "text-base sm:text-xl max-w-md" : "text-xs sm:text-sm"}`}>
                    {feature.description}
                  </p>
                </div>

                {feature.size === "large" && (
                  <div className="relative z-10 mt-8">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {config.images.userAvatars.map((url, n) => (
                          <div key={n} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 overflow-hidden">
                            <img src={url} alt={`User ${n + 1}`} referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-zinc-500 font-medium tracking-wider uppercase">Trusted by 10k+ owners</span>
                    </div>
                  </div>
                )}
                
                {(feature.size === "medium" || feature.size === "large") && (
                  <div className="absolute bottom-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Server className="w-32 h-32 rotate-12" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PricingSection 
        title="Our Services" 
        description="High-performance hosting solutions tailored for your needs. Choose from Minecraft, VPS, or Bot hosting." 
        plans={featuredPlans} 
        columns={3}
      />

      {/* CTA Section */}
      <section className="py-16 md:py-32 bg-black overflow-hidden relative">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-zinc-900 rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-12 md:p-24 border border-zinc-800 relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 blur-[100px] rounded-full" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
              <div className="max-w-xl text-center md:text-left">
                <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 tracking-tight leading-tight uppercase font-heading">
                  READY TO START YOUR <span className="text-zinc-500 italic">ADVENTURE?</span>
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base md:text-lg mb-6 md:mb-8 font-medium">
                  Join thousands of happy players and start your server today. 
                  Experience the best cloud hosting on the market.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => navigate("/select-category")}
                  className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 text-xs sm:text-sm px-8 sm:px-10 h-14 font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_0_rgba(255,255,255,0)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
                  Get Started Now
                </Button>
              </div>
              <div className="w-full md:w-1/3 aspect-square max-w-[280px] md:max-w-none mx-auto md:mx-0 bg-zinc-800 rounded-3xl overflow-hidden border border-zinc-700">
                <img 
                  src={config.images.ctaImage} 
                  alt="CTA Image" 
                  className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-32 bg-black">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-20"
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 tracking-tight uppercase font-heading">FREQUENTLY ASKED</h2>
            <p className="text-zinc-500 text-sm font-medium">
              Everything you need to know about our hosting services.
            </p>
          </motion.div>

          <Accordion className="w-full space-y-4">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <AccordionItem value={`item-${i}`} className="border border-zinc-800 rounded-xl px-6 bg-zinc-950/50">
                  <AccordionTrigger className="text-left font-bold hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400 pb-6 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
