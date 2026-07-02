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

export const MINECRAFT_PRICING: PricingPlan[] = config.minecraftPlans.map(plan => ({
  id: plan.id,
  name: plan.name.replace(" Plan", ""),
  price: plan.price.replace("₹", "").replace("/m", ""),
  description: `High performance Minecraft hosting with ${plan.ram} and ${plan.cpu}.`,
  ram: plan.ram,
  storage: plan.disk,
  cpu: plan.cpu,
  features: plan.features,
  popular: plan.id === "creeper",
  popularText: plan.id === "creeper" ? "BEST VALUE" : undefined,
  iconUrl: plan.image
}));

export const VPS_PRICING: PricingPlan[] = [
  {
    id: "vps-dev",
    name: "Cloud Dev",
    price: "750",
    originalPrice: "1000",
    description: "An affordable, dedicated environment for testing, sandboxing, and lightweight applications.",
    ram: "2GB",
    cpu: "1 vCore",
    storage: "40GB NVMe",
    features: ["KVM Virtualization", "Root Access", "Dedicated IP"],
    popular: false,
    discountBadge: "25% OFF"
  },
  {
    id: "vps-start",
    name: "Cloud Start",
    price: "1200",
    originalPrice: "1600",
    description: "Ideal for small projects, personal websites, or lightweight development environments.",
    ram: "4GB",
    cpu: "2 vCores",
    storage: "80GB NVMe",
    features: ["KVM Virtualization", "Root Access", "Dedicated IP"],
    popular: false,
    discountBadge: "25% OFF"
  },
  {
    id: "vps-pro",
    name: "Cloud Pro",
    price: "2400",
    originalPrice: "3200",
    description: "High-performance VPS for growing applications and production workloads.",
    ram: "8GB",
    cpu: "4 vCores",
    storage: "160GB NVMe",
    features: ["KVM Virtualization", "Root Access", "Snapshot Backups"],
    popular: true,
    popularText: "MOST POPULAR CHOICE",
    discountBadge: "25% OFF"
  },
  {
    id: "vps-ultra",
    name: "Cloud Ultra",
    price: "4800",
    originalPrice: "6400",
    description: "Enterprise-grade resources for high-traffic sites and complex infrastructures.",
    ram: "16GB",
    cpu: "8 vCores",
    storage: "320GB NVMe",
    features: ["KVM Virtualization", "Root Access", "Daily Backups"],
    popular: false,
    discountBadge: "25% OFF"
  },
  {
    id: "vps-extreme",
    name: "Cloud Extreme",
    price: "9600",
    originalPrice: "12000",
    description: "Ultrafast high-resource cluster nodes for maximum demanding workloads.",
    ram: "32GB",
    cpu: "16 vCores",
    storage: "640GB NVMe",
    features: ["KVM Virtualization", "Root Access", "Premium 10Gbps Uplink", "Daily Backups"],
    popular: false,
    discountBadge: "20% OFF"
  }
];

export const DISCORD_PRICING: PricingPlan[] = [
  {
    id: "bot-micro",
    name: "Bot Micro",
    price: "120",
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
