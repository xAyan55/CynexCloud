import * as React from "react";
import {
  Zap,
  ShieldCheck,
  Cpu,
  Server,
  Globe,
  Headset,
  Terminal,
  Bot
} from "lucide-react";
import { Feature, PricingPlan, FAQ, NavLink } from "./types";
import config from "./config.json";

export const NAV_LINKS: NavLink[] = [
  {
    name: "Services",
    href: "#",
    subLinks: [
      { name: "Minecraft Hosting", href: "/minecraft" },
      { name: "VPS Hosting", href: "/vps" },
      { name: "Bot Hosting", href: "/discord-bot" },
    ]
  },
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/#pricing" },
  { name: "Support", href: "/support" },
];

export const MINECRAFT_FEATURES: Feature[] = [
  {
    icon: <Zap className="w-6 h-6 text-white" />,
    title: "Instant Provisioning",
    description: "Your server is deployed to our high-performance nodes the microsecond your transaction clears. Zero latency from payment to play.",
    size: "large"
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-white" />,
    title: "Advanced DDoS Mitigation",
    description: "Multi-layered protection filtering up to 12Tbps of malicious traffic. Your community stays online, no matter the scale of the attack.",
    size: "small"
  },
  {
    icon: <Cpu className="w-6 h-6 text-white" />,
    title: "Ryzen™ 9 Performance",
    description: "Powered by the latest AMD Ryzen™ 9 processors with 5.0GHz+ clock speeds for ultimate single-thread performance.",
    size: "small"
  },
  {
    icon: <Server className="w-6 h-6 text-white" />,
    title: "Enterprise NVMe Storage",
    description: "RAID-10 NVMe SSDs providing 10x the speed of standard SSDs. World saves and modpack loading happen in the blink of an eye.",
    size: "medium"
  },
  {
    icon: <Globe className="w-6 h-6 text-white" />,
    title: "Global Edge Network",
    description: "Strategic data centers in NA, EU, and Asia-Pacific. Connect to the node closest to your players for sub-20ms latency.",
    size: "medium"
  },
  {
    icon: <Headset className="w-6 h-6 text-white" />,
    title: "24/7 Technical Support",
    description: "Our support engineers are Minecraft veterans. We don't just fix servers; we help you optimize your entire setup.",
    size: "small"
  }
];

export const MINECRAFT_PRICING: PricingPlan[] = config.minecraftPlans.map(plan => {
  const parts = plan.price.split("/")
  const inrPrice = parts[0].replace("₹", "").replace("/m", "")
  const usdPrice = parts[1]?.replace("$", "") || ""
  return {
    id: plan.id,
    name: plan.name.replace(" Plan", ""),
    price: inrPrice,
    usdPrice,
    description: `High performance Minecraft hosting with ${plan.ram} and ${plan.cpu}.`,
    ram: plan.ram,
    storage: plan.disk,
    cpu: plan.cpu,
    features: plan.features,
    popular: plan.id === "creeper",
    popularText: plan.id === "creeper" ? "BEST VALUE" : undefined,
    iconUrl: plan.image
  }
});

export const VPS_PRICING: PricingPlan[] = [
  {
    id: "bronze",
    name: "Bronze",
    price: "99",
    usdPrice: "0.99",
    description: "Entry-level VPS for lightweight tasks and personal projects.",
    ram: "4GB",
    cpu: "1 Core",
    storage: "20GB SSD",
    features: ["LXC Virtualization", "Root Access", "Shared IP", "SSD Storage"],
    popular: false,
    iconUrl: "/images/vps-imgs/bronze.png"
  },
  {
    id: "silver",
    name: "Silver",
    price: "199",
    usdPrice: "1.99",
    description: "Great value for small websites and development environments.",
    ram: "8GB",
    cpu: "2 Core",
    storage: "40GB SSD",
    features: ["LXC Virtualization", "Root Access", "Shared IP", "SSD Storage"],
    popular: false,
    iconUrl: "/images/vps-imgs/silver.png"
  },
  {
    id: "platinum",
    name: "Platinum",
    price: "299",
    usdPrice: "2.99",
    description: "Balanced performance for growing applications.",
    ram: "12GB",
    cpu: "3 Core",
    storage: "60GB SSD",
    features: ["LXC Virtualization", "Root Access", "Shared IP", "Snapshot Backups"],
    popular: false,
    iconUrl: "/images/vps-imgs/platinum.png"
  },
  {
    id: "gold",
    name: "Gold",
    price: "399",
    usdPrice: "3.99",
    description: "High-performance VPS for production workloads.",
    ram: "16GB",
    cpu: "4 Core",
    storage: "80GB SSD",
    features: ["LXC Virtualization", "Root Access", "Shared IP", "Snapshot Backups"],
    popular: true,
    popularText: "RECOMMENDED",
    iconUrl: "/images/vps-imgs/gold.png"
  },
  {
    id: "diamond",
    name: "Diamond",
    price: "499",
    usdPrice: "4.99",
    description: "Premium resources for demanding applications.",
    ram: "20GB",
    cpu: "5 Core",
    storage: "100GB SSD",
    features: ["LXC Virtualization", "Root Access", "Shared IP", "Daily Backups"],
    popular: false,
    iconUrl: "/images/vps-imgs/diamond.png"
  },
  {
    id: "crystal",
    name: "Crystal",
    price: "599",
    usdPrice: "5.99",
    description: "Enterprise-grade power for high-traffic platforms.",
    ram: "24GB",
    cpu: "6 Core",
    storage: "120GB SSD",
    features: ["LXC Virtualization", "Root Access", "Shared IP", "Daily Backups", "Priority Support"],
    popular: false,
    iconUrl: "/images/vps-imgs/crystal.png"
  },
  {
    id: "amber",
    name: "Amber",
    price: "699",
    usdPrice: "6.99",
    description: "Maximum resources for the most demanding workloads.",
    ram: "28GB",
    cpu: "7 Core",
    storage: "140GB SSD",
    features: ["LXC Virtualization", "Root Access", "Shared IP", "Daily Backups", "Priority Support", "10Gbps Uplink"],
    popular: false,
    iconUrl: "/images/vps-imgs/amber.png"
  }
];

export const DISCORD_PRICING: PricingPlan[] = [
  {
    id: "bot-micro",
    name: "Bot Micro",
    price: "120",
    usdPrice: "1.20",
    originalPrice: "200",
    description: "The lightest setup for background tasks and single-channel helper bots.",
    ram: "256MB",
    cpu: "0.25 vCore",
    storage: "2GB SSD",
    features: ["Node.js/Python/Go", "99.9% Uptime"],
    popular: false,
    discountBadge: "40% OFF"
  },
  {
    id: "bot-starter",
    name: "Bot Starter",
    price: "240",
    usdPrice: "2.40",
    originalPrice: "400",
    description: "Perfect for small community bots and simple automation tasks.",
    ram: "512MB",
    cpu: "0.5 vCore",
    storage: "5GB SSD",
    features: ["Node.js/Python/Go", "99.9% Uptime"],
    popular: false,
    discountBadge: "40% OFF"
  },
  {
    id: "bot-advanced",
    name: "Bot Advanced",
    price: "480",
    usdPrice: "4.80",
    originalPrice: "800",
    description: "Optimized for large servers with many active users and complex commands.",
    ram: "1GB",
    cpu: "1 vCore",
    storage: "10GB SSD",
    features: ["Node.js/Python/Go", "Auto-Restart"],
    popular: true,
    popularText: "RECOMMENDED FOR PROS",
    discountBadge: "40% OFF"
  },
  {
    id: "bot-enterprise",
    name: "Bot Enterprise",
    price: "1000",
    usdPrice: "10.00",
    originalPrice: "1600",
    description: "Maximum performance for global bots serving millions of users.",
    ram: "2GB",
    cpu: "2 vCores",
    storage: "20GB SSD",
    features: ["Node.js/Python/Go", "Custom Database"],
    popular: false,
    discountBadge: "35% OFF"
  },
  {
    id: "bot-extreme",
    name: "Bot Extreme",
    price: "1800",
    usdPrice: "18.00",
    originalPrice: "2500",
    description: "Premium hosting for top-tier verified Discord bots with high-intensity command queries.",
    ram: "4GB",
    cpu: "4 vCores",
    storage: "40GB SSD",
    features: ["Node.js/Python/Go", "Custom Redis/Database", "Priority 24/7 Support"],
    popular: false,
    discountBadge: "28% OFF"
  }
];

export const FAQS: FAQ[] = [
  {
    question: "How long does it take to set up my server?",
    answer: "Setup is instantaneous! Once your payment is processed, our automated system provisions your server and sends you the login details via email within seconds."
  },
  {
    question: "Can I upgrade my plan later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time through our client area. Your files and settings will remain intact during the transition."
  },
  {
    question: "What versions of Minecraft do you support?",
    answer: "We support all versions of Minecraft, including Java Edition, Bedrock Edition, and popular modpacks like RLcraft, SkyFactory, and more."
  },
  {
    question: "Do you offer a money-back guarantee?",
    answer: "We offer a 72-hour money-back guarantee if you are not satisfied with our service. No questions asked."
  }
];
