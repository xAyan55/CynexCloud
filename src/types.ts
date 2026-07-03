import { ReactNode } from "react";

export interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
  size: "small" | "medium" | "large";
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  usdPrice?: string;
  originalPrice?: string;
  description?: string;
  ram?: string;
  cpu?: string;
  storage?: string;
  slots?: string;
  features: string[];
  popular: boolean;
  popularText?: string;
  iconUrl?: string;
  discountBadge?: string;
  category?: string;
  ram_mb?: number;
  cpu_pct?: number;
  disk_mb?: number;
  price_numeric?: number;
  image?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface NavLink {
  name: string;
  href: string;
  subLinks?: { name: string; href: string }[];
}
