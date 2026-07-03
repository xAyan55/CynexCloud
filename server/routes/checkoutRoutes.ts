import { Router, Response } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { queryRun } from "../db/database";
import { requireAuth } from "./authRoutes";
import { getPterodactylNodesForCheckout, getPterodactylSoftwareForCheckout } from "../services/pterodactylService";
import { getNodes as getCynexvmNodes, getImages as getCynexvmImages, getCynexVMConfig } from "../services/cynexvmService";

// Default values to seed if Firestore collections are empty or unreachable
const DEFAULT_LOCATIONS = [
  { id: "loc-de", name: "Germany", countryCode: "DE", flag: "🇩🇪", ping: "25ms", availability: "100%", active: true },
  { id: "loc-ro", name: "Romania", countryCode: "RO", flag: "🇷🇴", ping: "15ms", availability: "99.9%", active: true },
  { id: "loc-us", name: "United States", countryCode: "US", flag: "🇺🇸", ping: "95ms", availability: "99.99%", active: true },
  { id: "loc-sg", name: "Singapore", countryCode: "SG", flag: "🇸🇬", ping: "140ms", availability: "99.8%", active: true },
  { id: "loc-in", name: "India", countryCode: "IN", flag: "🇮🇳", ping: "55ms", availability: "99.9%", active: true }
];

const DEFAULT_SOFTWARE = [
  { id: "sw-vanilla", name: "Vanilla", versions: ["1.21.4", "1.21.3", "1.20.6", "1.20.4", "1.19.4", "1.16.5"], active: true },
  { id: "sw-paper", name: "Paper", versions: ["1.21.4", "1.21.3", "1.20.6", "1.20.4", "1.19.4", "1.18.2", "1.16.5", "1.8.8"], active: true },
  { id: "sw-purpur", name: "Purpur", versions: ["1.21.4", "1.21.3", "1.20.6", "1.20.4", "1.19.4", "1.18.2", "1.16.5"], active: true },
  { id: "sw-fabric", name: "Fabric", versions: ["1.21.4", "1.21.3", "1.20.6", "1.20.4", "1.19.4", "1.18.2", "1.16.5"], active: true },
  { id: "sw-forge", name: "Forge", versions: ["1.20.1", "1.19.2", "1.18.2", "1.16.5", "1.12.2"], active: true },
  { id: "sw-velocity", name: "Velocity", versions: ["3.3.0-SNAPSHOT", "3.2.0"], active: true },
  { id: "sw-bungeecord", name: "BungeeCord", versions: ["latest"], active: true }
];

const DEFAULT_VPS_NODES = [
  { id: "node-auto", name: "Auto (Best Available)", country: "Auto", ping: "—", availableRam: 0, availableDisk: 0, isOnline: true, flag: "🌐" }
];

const DEFAULT_VPS_IMAGES = [
  { fingerprint: "ubuntu/22.04", aliases: ["ubuntu/22.04/amd64"], description: "Ubuntu 22.04 LTS (Jammy Jellyfish)", sizeBytes: 0 },
  { fingerprint: "debian/12", aliases: ["debian/12/amd64"], description: "Debian 12 (Bookworm)", sizeBytes: 0 },
  { fingerprint: "ubuntu/24.04", aliases: ["ubuntu/24.04/amd64"], description: "Ubuntu 24.04 LTS (Noble Numbat)", sizeBytes: 0 },
  { fingerprint: "centos/9", aliases: ["centos/9/amd64"], description: "CentOS Stream 9", sizeBytes: 0 }
];

const DEFAULT_ADDONS = [
  { id: "add-ram", name: "Extra RAM (+1GB)", price_pct: 25, description: "Adds 1GB of premium ECC DDR4 Memory allocation.", active: true },
  { id: "add-storage", name: "Additional Storage (+10GB)", price_pct: 15, description: "10GB extra NVMe disk storage space.", active: true },
  { id: "add-cpu", name: "+100% CPU", price_pct: 30, description: "Doubles your CPU allocation for heavy workloads.", active: true },
  { id: "add-ddos", name: "DDoS Premium Shield", price_pct: 20, description: "Advanced L4/L7 custom scrubbing mapping.", active: true },
  { id: "add-priority", name: "Priority SLA Support", price_pct: 10, description: "Fastest response ticket queues (under 30 mins).", active: true },
  { id: "add-backups", name: "Automatic Backups", price_pct: 10, description: "Daily off-site snapshots retained for 7 days.", active: true }
];

const DEFAULT_CYCLES = [
  { id: "monthly", name: "Monthly", months: 1, discount: 0 },
  { id: "quarterly", name: "Quarterly", months: 3, discount: 0.05 },
  { id: "semiannual", name: "Semi-Annual", months: 6, discount: 0.08 },
  { id: "annual", name: "Annual", months: 12, discount: 0.15 }
];

/**
 * Factory function — receives the Firestore db wrapper from server.ts
 */
export default function createCheckoutRouter(db: any) {
  const router = Router();

  /**
   * Helper to ensure a collection is seeded with defaults if empty
   */
  async function getOrSeedCollection<T>(collectionName: string, defaults: T[]): Promise<T[]> {
    try {
      const snapshot = await db.collection(collectionName).get();
      if (snapshot.empty) {
        try {
          const batch = db.batch();
          defaults.forEach((item: any) => {
            const docRef = db.collection(collectionName).doc(item.id);
            batch.set(docRef, item);
          });
          await batch.commit();
        } catch (err: any) {
          console.warn(`[Checkout DB] Failed to seed ${collectionName}:`, err.message);
        }
        return defaults;
      }
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as any));
    } catch (err: any) {
      console.warn(`[Checkout DB] Failed to read collection ${collectionName}, falling back to defaults:`, err.message);
      return defaults;
    }
  }

  /**
   * Helper to find a plan by ID from the plans collection
   */
  async function findPlanById(planId: string): Promise<any | null> {
    try {
      const snapshot = await db.collection("plans").get();
      const plans = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      const found = plans.find((p: any) => p.id === planId);
      if (found) return found;
    } catch (err: any) {
      console.warn(`[Checkout DB] Failed to read plans from database, falling back to local config:`, err.message);
    }
    
    // Fallback to local config.json plans
    try {
      const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'config.json'), 'utf8'));
      const minecraftPlans = (config.minecraftPlans || []).map((p: any) => ({
        ...p,
        category: 'minecraft',
        storage: p.disk,
        price_numeric: parseFloat(p.price.match(/[0-9.]+/)?.[0] || "0")
      }));
      const foundPlan = minecraftPlans.find((p: any) => p.id === planId);
      if (foundPlan) return foundPlan;
    } catch (readErr: any) {
      console.error("[Checkout Config] Failed to read config.json fallback:", readErr.message);
    }

    // Fallback to VPS plans (from constants, hardcoded here as inline seed)
    const vpsPlans = [
      { id: "bronze", name: "Bronze", price: "₹99", price_numeric: 99, ram: "4GB", cpu: "1 Core", storage: "20GB SSD", cpuCores: 1, memoryMb: 4096, storageGb: 20, description: "Entry-level VPS for lightweight tasks and personal projects.", image: "/images/vps-imgs/bronze.png", features: ["LXC Virtualization", "Root Access", "Shared IP", "SSD Storage"], popular: false, category: "vps" },
      { id: "silver", name: "Silver", price: "₹199", price_numeric: 199, ram: "8GB", cpu: "2 Core", storage: "40GB SSD", cpuCores: 2, memoryMb: 8192, storageGb: 40, description: "Great value for small websites and development environments.", image: "/images/vps-imgs/silver.png", features: ["LXC Virtualization", "Root Access", "Shared IP", "SSD Storage"], popular: false, category: "vps" },
      { id: "platinum", name: "Platinum", price: "₹299", price_numeric: 299, ram: "12GB", cpu: "3 Core", storage: "60GB SSD", cpuCores: 3, memoryMb: 12288, storageGb: 60, description: "Balanced performance for growing applications.", image: "/images/vps-imgs/platinum.png", features: ["LXC Virtualization", "Root Access", "Shared IP", "Snapshot Backups"], popular: false, category: "vps" },
      { id: "gold", name: "Gold", price: "₹399", price_numeric: 399, ram: "16GB", cpu: "4 Core", storage: "80GB SSD", cpuCores: 4, memoryMb: 16384, storageGb: 80, description: "High-performance VPS for production workloads.", image: "/images/vps-imgs/gold.png", features: ["LXC Virtualization", "Root Access", "Shared IP", "Snapshot Backups"], popular: true, category: "vps" },
      { id: "diamond", name: "Diamond", price: "₹499", price_numeric: 499, ram: "20GB", cpu: "5 Core", storage: "100GB SSD", cpuCores: 5, memoryMb: 20480, storageGb: 100, description: "Premium resources for demanding applications.", image: "/images/vps-imgs/diamond.png", features: ["LXC Virtualization", "Root Access", "Shared IP", "Daily Backups"], popular: false, category: "vps" },
      { id: "crystal", name: "Crystal", price: "₹599", price_numeric: 599, ram: "24GB", cpu: "6 Core", storage: "120GB SSD", cpuCores: 6, memoryMb: 24576, storageGb: 120, description: "Enterprise-grade power for high-traffic platforms.", image: "/images/vps-imgs/crystal.png", features: ["LXC Virtualization", "Root Access", "Shared IP", "Daily Backups", "Priority Support"], popular: false, category: "vps" },
      { id: "amber", name: "Amber", price: "₹699", price_numeric: 699, ram: "28GB", cpu: "7 Core", storage: "140GB SSD", cpuCores: 7, memoryMb: 28672, storageGb: 140, description: "Maximum resources for the most demanding workloads.", image: "/images/vps-imgs/amber.png", features: ["LXC Virtualization", "Root Access", "Shared IP", "Daily Backups", "Priority Support", "10Gbps Uplink"], popular: false, category: "vps" }
    ];
    const foundVps = vpsPlans.find((p: any) => p.id === planId);
    if (foundVps) return foundVps;

    return null;
  }

  /**
   * GET /api/checkout/config
   * Retrieves checkout configuration parameters dynamically
   */
  router.get("/config", async (req, res) => {
    try {
      // 1. Load locations/nodes dynamically from Pterodactyl, fallback to DB/defaults
      let locations;
      try {
        locations = await getPterodactylNodesForCheckout();
      } catch (err: any) {
        console.warn("[Checkout Nodes] Failed to fetch Pterodactyl nodes, falling back to database/defaults:", err.message);
        locations = await getOrSeedCollection("checkout_locations", DEFAULT_LOCATIONS);
      }

      // 2. Load software/nests/eggs dynamically from Pterodactyl, fallback to DB/defaults
      let software;
      try {
        software = await getPterodactylSoftwareForCheckout();
      } catch (err: any) {
        console.warn("[Checkout Software] Failed to fetch Pterodactyl software, falling back to database/defaults:", err.message);
        software = await getOrSeedCollection("checkout_software", DEFAULT_SOFTWARE);
      }

      // 3. Load add-ons and cycles
      const addons = await getOrSeedCollection("checkout_addons", DEFAULT_ADDONS);
      const cycles = await getOrSeedCollection("checkout_cycles", DEFAULT_CYCLES);

      res.json({
        success: true,
        locations: locations.filter((l: any) => l.isOnline ?? l.active ?? true),
        software: software.filter((s: any) => s.active ?? true),
        addons: addons.filter((a: any) => a.active),
        cycles
      });
    } catch (err: any) {
      console.error("Failed to load checkout settings:", err);
      res.status(500).json({ error: "Failed to load checkout configuration parameters." });
    }
  });

  /**
   * POST /api/checkout/calculate
   * Recalculate price on the server to prevent customer-side price spoofing
   */
  router.post("/calculate", async (req, res) => {
    const { planId, billingCycle, selectedAddons, coupon } = req.body;
    if (!planId || !billingCycle) {
      return res.status(400).json({ error: "planId and billingCycle are required." });
    }

    try {
      // 1. Fetch base plan
      const plan = await findPlanById(planId);
      if (!plan) {
        return res.status(404).json({ error: "Plan config not found." });
      }
      const basePrice = parseFloat(plan.price_numeric || plan.price || "0");

      // 2. Fetch billing cycle discount
      const cycles = await getOrSeedCollection("checkout_cycles", DEFAULT_CYCLES);
      const cycle = cycles.find((c: any) => c.id === billingCycle);
      if (!cycle) {
        return res.status(400).json({ error: "Invalid billing cycle." });
      }

      const months = cycle.months;
      const baseSubtotal = basePrice * months;

      // 3. Fetch add-ons price (percentage-based)
      const calcAddonPrice = (addon: any) => addon.price_pct ? Math.round(basePrice * addon.price_pct / 100) : (addon.price || 0);

      const allAddons = await getOrSeedCollection("checkout_addons", DEFAULT_ADDONS);
      let addonsTotal = 0;
      (selectedAddons || []).forEach((addonId: string) => {
        const add = allAddons.find((a: any) => a.id === addonId);
        if (add) {
          addonsTotal += calcAddonPrice(add) * months;
        }
      });

      // 4. Calculate pricing discounts & taxes (GST 18%)
      const subtotal = baseSubtotal + addonsTotal;
      const cycleDiscountAmount = baseSubtotal * cycle.discount;

      // Coupon discount
      let couponDiscountPct = 0;
      if (coupon) {
        const normalizedCoupon = coupon.toUpperCase().trim();
        if (normalizedCoupon === "CYNEX20") {
          couponDiscountPct = 0.20;
        } else if (normalizedCoupon === "START10") {
          couponDiscountPct = 0.10;
        }
      }
      
      const couponDiscountAmount = Math.round((subtotal - cycleDiscountAmount) * couponDiscountPct * 100) / 100;
      const totalDiscount = cycleDiscountAmount + couponDiscountAmount;

      // Tax (18%)
      const taxableAmount = Math.max(0, subtotal - totalDiscount);
      const taxAmount = Math.round(taxableAmount * 0.18 * 100) / 100;
      const total = taxableAmount + taxAmount;

      const recurringPrice = basePrice + (selectedAddons || []).map((addonId: string) => {
        const add = allAddons.find((a: any) => a.id === addonId);
        return add ? calcAddonPrice(add) : 0;
      }).reduce((acc: number, curr: number) => acc + curr, 0);

      res.json({
        success: true,
        calculation: {
          basePrice,
          months,
          baseSubtotal,
          addonsTotal,
          subtotal,
          cycleDiscountAmount,
          couponDiscountAmount,
          discountAmount: totalDiscount,
          discountPct: (cycle.discount * 100) + (couponDiscountPct * 100),
          taxAmount,
          total,
          recurringPrice
        }
      });
    } catch (err: any) {
      console.error("[Checkout Calculate] Error:", err.message);
      res.status(500).json({ error: "Price verification failed: " + err.message });
    }
  });

  /**
   * POST /api/checkout/create-order
   * Creates the order, service, and invoice records, securely calculating prices on the server.
   */
  router.post("/create-order", requireAuth, async (req: any, res: Response) => {
    const { 
      planId, 
      serverName, 
      billingCycle, 
      locationId, 
      softwareId, 
      version, 
      selectedAddons,
      coupon,
      nodeId,
      osTemplate,
      rootPassword
    } = req.body;

    if (!planId || !serverName || !billingCycle) {
      return res.status(400).json({ error: "Missing required order parameters." });
    }

    try {
      // 1. Fetch base plan
      const plan = await findPlanById(planId);
      if (!plan) {
        return res.status(404).json({ error: "Plan configuration not found." });
      }
      const basePrice = parseFloat(plan.price_numeric || plan.price || "0");

      // 2. Validate cycle & discount
      const cycles = await getOrSeedCollection("checkout_cycles", DEFAULT_CYCLES);
      const cycle = cycles.find((c: any) => c.id === billingCycle);
      if (!cycle) return res.status(400).json({ error: "Invalid billing cycle." });

      const months = cycle.months;
      const baseSubtotal = basePrice * months;

      // 3. Validate and calculate add-ons (percentage-based)
      const calcAddonPrice = (addon: any) => addon.price_pct ? Math.round(basePrice * addon.price_pct / 100) : (addon.price || 0);

      const allAddons = await getOrSeedCollection("checkout_addons", DEFAULT_ADDONS);
      let addonsTotal = 0;
      const verifiedAddons: any[] = [];
      (selectedAddons || []).forEach((addonId: string) => {
        const add = allAddons.find((a: any) => a.id === addonId);
        if (add) {
          const addonPrice = calcAddonPrice(add);
          addonsTotal += addonPrice * months;
          verifiedAddons.push({ id: add.id, name: add.name, price: addonPrice });
        }
      });

      // 5. Finalize calculation
      const subtotal = baseSubtotal + addonsTotal;
      const cycleDiscountAmount = baseSubtotal * cycle.discount;

      let couponDiscountPct = 0;
      if (coupon) {
        const normalizedCoupon = coupon.toUpperCase().trim();
        if (normalizedCoupon === "CYNEX20") {
          couponDiscountPct = 0.20;
        } else if (normalizedCoupon === "START10") {
          couponDiscountPct = 0.10;
        }
      }
      const couponDiscountAmount = Math.round((subtotal - cycleDiscountAmount) * couponDiscountPct * 100) / 100;
      const totalDiscount = cycleDiscountAmount + couponDiscountAmount;

      const taxableAmount = Math.max(0, subtotal - totalDiscount);
      const taxAmount = Math.round(taxableAmount * 0.18 * 100) / 100;
      const finalPrice = taxableAmount + taxAmount;

      // Generate unique keys
      const orderId = "ORD-" + crypto.randomUUID().substring(0, 8);
      const invoiceId = "INV-" + crypto.randomUUID().substring(0, 8);
      const serviceId = "SRV-" + crypto.randomUUID().substring(0, 8);

      // Check if this is a VPS plan
      const isVPS = Boolean(nodeId || osTemplate);

      if (isVPS) {
        // 6a. Save VPS service configuration (CynexVM)
        await queryRun(
          `INSERT INTO services (id, userId, planId, name, status, price, billingCycle, addons, nodeId, osTemplate, rootPassword) 
           VALUES (?, ?, ?, ?, 'Pending Payment', ?, ?, ?, ?, ?, ?)`,
          [
            serviceId, 
            req.user.userId, 
            planId, 
            serverName, 
            finalPrice, 
            cycle.name, 
            JSON.stringify(verifiedAddons),
            nodeId || "",
            osTemplate || "ubuntu/22.04",
            rootPassword || ""
          ]
        );
      } else {
        // 6b. Validate Minecraft/Pterodactyl-specific fields
        if (!locationId || !softwareId || !version) {
          return res.status(400).json({ error: "Missing required order parameters." });
        }

        let locations;
        try {
          locations = await getPterodactylNodesForCheckout();
        } catch (err: any) {
          locations = await getOrSeedCollection("checkout_locations", DEFAULT_LOCATIONS);
        }
        const targetLocation = locations.find((l: any) => String(l.id) === String(locationId));
        if (!targetLocation) return res.status(400).json({ error: "Invalid location selection." });

        let softwares;
        try {
          softwares = await getPterodactylSoftwareForCheckout();
        } catch (err: any) {
          softwares = await getOrSeedCollection("checkout_software", DEFAULT_SOFTWARE);
        }
        const targetSoftware = softwares.find((s: any) => String(s.id) === String(softwareId));
        if (!targetSoftware) return res.status(400).json({ error: "Invalid software selection." });
        if (!targetSoftware.versions.includes(version)) return res.status(400).json({ error: "Invalid version selection." });

        const eggId = targetSoftware.eggId || 1;
        const nestId = targetSoftware.nestId || 1;

        await queryRun(
          `INSERT INTO services (id, userId, planId, name, status, price, billingCycle, location, software, version, addons, locationId, nestId, eggId) 
           VALUES (?, ?, ?, ?, 'Pending Payment', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            serviceId, 
            req.user.userId, 
            planId, 
            serverName, 
            finalPrice, 
            cycle.name, 
            targetLocation.name, 
            targetSoftware.name, 
            version, 
            JSON.stringify(verifiedAddons),
            parseInt(targetLocation.id, 10) || 1,
            parseInt(nestId, 10) || 1,
            parseInt(eggId, 10) || 1
          ]
        );
      }

      // 7. Save order record
      await queryRun(
        `INSERT INTO orders (id, userId, planId, status, price) VALUES (?, ?, ?, 'Pending Payment', ?)`,
        [orderId, req.user.userId, planId, finalPrice]
      );

      // 8. Save invoice record
      await queryRun(
        `INSERT INTO invoices (id, orderId, userId, amount, status) VALUES (?, ?, ?, ?, 'Unpaid')`,
        [invoiceId, orderId, req.user.userId, finalPrice]
      );

      // 9. Generate notification record
      await queryRun(
        `INSERT INTO notifications (id, userId, title, message) VALUES (?, ?, 'Invoice Generated', ?)`,
        ["notif-" + crypto.randomUUID(), req.user.userId, `Checkout completed. Invoice ${invoiceId} generated for server '${serverName}'.`]
      );

      console.log(`[Checkout] Order ${orderId} created successfully. Invoice: ${invoiceId}. Billed total: ₹${finalPrice}.`);

      res.json({
        success: true,
        orderId,
        invoiceId,
        serviceId
      });
    } catch (err: any) {
      console.error("Checkout order creation failed:", err);
      res.status(500).json({ error: "Checkout failed to create order: " + err.message });
    }
  });

  /**
   * GET /api/checkout/vps-config
   * Retrieves CynexVM nodes and OS templates for VPS checkout
   */
  router.get("/vps-config", async (req, res) => {
    try {
      let nodes: any[];
      let images: any[];
      let panelUrl = "";

      try {
        const config = await getCynexVMConfig();
        panelUrl = config.url || "";
        if (config.url) {
          nodes = (await getCynexvmNodes()) || [];
          images = (await getCynexvmImages()) || [];
        } else {
          nodes = DEFAULT_VPS_NODES;
          images = DEFAULT_VPS_IMAGES;
        }
      } catch (err: any) {
        console.warn("[Checkout VPS] Failed to fetch CynexVM data, using defaults:", err.message);
        nodes = DEFAULT_VPS_NODES;
        images = DEFAULT_VPS_IMAGES;
      }

      res.json({ success: true, nodes: nodes.filter((n: any) => n.isOnline !== false), images, panelUrl });
    } catch (err: any) {
      console.error("Failed to load VPS checkout config:", err);
      res.status(500).json({ error: "Failed to load VPS checkout configuration." });
    }
  });

  return router;
}
