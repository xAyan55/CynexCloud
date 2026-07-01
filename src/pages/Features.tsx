import * as React from "react";
import { motion } from "motion/react";
import { 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Server, 
  Globe, 
  Terminal, 
  Activity, 
  Database, 
  Key, 
  RefreshCw,
  HardDrive,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import config from "../config.json";

interface FeatureDetail {
  icon: React.ReactNode;
  title: string;
  category: string;
  description: string;
  specs: string[];
}

export default function Features() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [latencyRatings, setLatencyRatings] = React.useState([
    { region: "Frankfurt, DE", latency: 9, base: 9, bar: "w-[12%]" },
    { region: "London, UK", latency: 14, base: 14, bar: "w-[18%]" },
    { region: "New York, US", latency: 38, base: 38, bar: "w-[42%]" },
    { region: "Singapore, SG", latency: 82, base: 82, bar: "w-[85%]" }
  ]);
  const [isPinging, setIsPinging] = React.useState(false);

  const runBenchmark = () => {
    if (isPinging) return;
    setIsPinging(true);
    let count = 0;
    const interval = setInterval(() => {
      setLatencyRatings(prev => prev.map(item => {
        const randOffset = Math.random() * 6 - 3;
        const newLatency = Math.max(2, Math.round(item.base + randOffset));
        // Compute responsive bar length percentage
        const pct = Math.min(100, Math.max(5, Math.round((newLatency / 100) * 100)));
        return {
          ...item,
          latency: newLatency,
          bar: `w-[${pct}%]`
        };
      }));
      count++;
      if (count > 10) {
        clearInterval(interval);
        setIsPinging(false);
      }
    }, 120);
  };

  const categories = ["All", "Hardware", "Security", "Network", "Control Panel"];

  const featuresList: FeatureDetail[] = [
    {
      icon: <Cpu className="w-6 h-6 text-white" />,
      title: "AMD Ryzen™ 9 7950X",
      category: "Hardware",
      description: "Experience maximum single-thread capability with industry-leading processors clocked at 5.0GHz+. Perfect for heavy modpacks and high-traffic servers.",
      specs: ["16 Cores / 32 Threads", "Up to 5.7GHz Boost", "DDR5 ECC RAM Memory"]
    },
    {
      icon: <HardDrive className="w-6 h-6 text-white" />,
      title: "PCIe 5.0 Enterprise NVMe",
      category: "Hardware",
      description: "Our storage arrays run in RAID-10 configuration, offering read/write speeds exceeding 10,000 MB/s. No chunk loading stutters or database lags.",
      specs: ["RAID-10 Data Security", "Extreme IOPS Throughput", "Zero Latency Read/Write"]
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
      title: "12Tbps+ DDoS Mitigation",
      category: "Security",
      description: "Always-on, multi-tiered protection specifically tuned for game traffic and web services. Filter out malicious query attacks instantly.",
      specs: ["Anycast Filtering", "Sub-Millisecond Detection", "L3/L4/L7 Protection"]
    },
    {
      icon: <Globe className="w-6 h-6 text-white" />,
      title: "Global Low-Latency Edge",
      category: "Network",
      description: "Strategically located data centers across North America, Europe, and Asia-Pacific. Connect your users to the nearest node for lag-free performance.",
      specs: ["Premium Tier-1 Carriers", "Sub-15ms Local Ping", "BGP Optimized Routing"]
    },
    {
      icon: <Terminal className="w-6 h-6 text-white" />,
      title: "Custom Pterodactyl Panel",
      category: "Control Panel",
      description: "Manage your instances with our highly customized control panel. Features real-time logs, resource usage metrics, and full server controls.",
      specs: ["SFTP & File Manager", "One-Click Mod Installers", "Sub-user Access Controls"]
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-white" />,
      title: "Automated Daily Backups",
      category: "Security",
      description: "Never lose your files again. Our automated offsite backup system captures your entire instance configuration daily, keeping up to 7 restore points.",
      specs: ["Offsite Cold Storage", "One-Click Restores", "Manual Snapshot Options"]
    },
    {
      icon: <Database className="w-6 h-6 text-white" />,
      title: "Instant Database Creation",
      category: "Control Panel",
      description: "Create MySQL or MongoDB databases for your apps or plugins directly from the control panel. Fully secure, isolated, and high performance.",
      specs: ["Isolated Databases", "Localhost & External Access", "Automated DB Backups"]
    },
    {
      icon: <Key className="w-6 h-6 text-white" />,
      title: "Full SFTP & SSH Access",
      category: "Control Panel",
      description: "Advanced developers have complete freedom. Securely upload, download, and modify your files using any standard SFTP client.",
      specs: ["Encrypted SSH Transfer", "No File Size Limits", "Custom Command Scripts"]
    }
  ];

  const filteredFeatures = selectedCategory === "All" 
    ? featuresList 
    : featuresList.filter(f => f.category === selectedCategory);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
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
              Enterprise Grade Infrastructure
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-8xl font-black tracking-tighter mb-6 md:mb-8 max-w-4xl mx-auto leading-none md:leading-tight uppercase font-heading text-gradient">
              THE POWER TO <span className="text-zinc-600 italic font-thin">DOMINATE</span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-12 font-medium leading-relaxed">
              We don&apos;t compromise on hardware. Discover the underlying technology and advanced security layers that make {config.brand.name} the gold standard in cloud hosting.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="container mx-auto px-6 mb-12 md:mb-16 relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 border-b border-white/5 pb-6 md:pb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-white text-black scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  : "bg-zinc-950 text-zinc-500 border border-white/5 hover:text-white hover:border-white/20"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 mb-20 md:mb-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {filteredFeatures.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              onMouseMove={handleMouseMove}
              className="group relative rounded-[2.5rem] border border-white/5 bg-zinc-950/40 p-6 sm:p-8 md:p-12 overflow-hidden flex flex-col justify-between transition-all duration-700 hover:border-white/25 hover:bg-zinc-900/40 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(255,255,255,0.06)_0%,transparent_50%)]" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-700 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="relative z-10 text-white group-hover:text-black transition-colors duration-700">
                      {feature.icon}
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-600 bg-zinc-950 border border-white/5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full">
                    {feature.category}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-3 sm:mb-4 text-white font-heading">
                  {feature.title}
                </h3>
                <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 font-medium">
                  {feature.description}
                </p>
              </div>

              <div className="border-t border-white/5 pt-4 sm:pt-6 mt-auto">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {feature.specs.map((spec) => (
                    <span 
                      key={spec} 
                      className="text-[9px] sm:text-[10px] font-bold text-zinc-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Network Benchmark / Hardware Spec Block */}
      <section className="container mx-auto px-6 mb-20 md:mb-32 relative z-10">
        <div className="bg-zinc-950/60 rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-12 md:p-20 border border-white/5 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 blur-[100px] rounded-full" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <div className="inline-block mb-4 border border-white/5 text-zinc-500 px-4 py-1 uppercase tracking-[0.4em] text-[9px] bg-zinc-950 rounded-full">
                Benchmark Standard
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 md:mb-6 tracking-tight leading-tight uppercase font-heading">
                HARDWARE THAT <br />
                LEAVES COMPETITION IN <br />
                <span className="text-zinc-600 italic">THE DUST</span>
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base mb-6 md:mb-8 leading-relaxed font-medium">
                Most hosts overcrowd their physical servers to maximize profit. We guarantee dedicated resource allocation and keep CPU loads under 50% to ensure your app always runs at peak responsiveness.
              </p>
              <div className="space-y-4 md:space-y-6">
                {[
                  { label: "Single-Thread CPU Performance", value: "100%", sub: "Ryzen 9 7950X Extreme" },
                  { label: "Memory Latency", value: "Lowest", sub: "DDR5 ECC Dual-Channel" },
                  { label: "Network Routing Uplink", value: "10Gbps Burst", sub: "Redundant edge transit" }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-white/5 pb-3 md:pb-4">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white uppercase">{item.label}</div>
                      <div className="text-[10px] sm:text-xs text-zinc-500 mt-1">{item.sub}</div>
                    </div>
                    <div className="text-base sm:text-xl font-black font-heading text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="aspect-video bg-zinc-900/60 border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${isPinging ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"}`} />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-400">Live Network Latency Monitor</span>
                </div>
                <button
                  type="button"
                  onClick={runBenchmark}
                  disabled={isPinging}
                  className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-colors border border-white/5 px-2.5 py-1 rounded-md bg-black/40 disabled:opacity-50"
                >
                  {isPinging ? "Pinging Nodes..." : "Test Latency"}
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-3 sm:gap-4">
                {latencyRatings.map((ping, i) => {
                  const pct = Math.min(100, Math.max(10, Math.round((ping.latency / 120) * 100)));
                  return (
                    <div key={i} className="space-y-1 sm:space-y-2">
                      <div className="flex justify-between text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400">
                        <span>{ping.region}</span>
                        <span className="text-white font-mono">{ping.latency}ms</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-zinc-500 to-white rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-6 text-center">
        <h2 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight mb-6 md:mb-8 uppercase font-heading">
          READY TO EXPERIENCE THE DIFFERENCE?
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
