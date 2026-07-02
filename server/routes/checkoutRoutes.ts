import { Router, Response } from "express";
import crypto from "crypto";
import { queryRun } from "../db/database";
import { requireAuth } from "./authRoutes";

// Default values to seed if Firestore collections are empty
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

const DEFAULT_ADDONS = [
  { id: "add-ram", name: "Extra RAM (+1GB)", price: 150, description: "Adds 1GB of premium ECC DDR4 Memory allocation.", active: true },
  { id: "add-storage", name: "Additional Storage (+10GB)", price: 50, description: "10GB extra NVMe disk storage space.", active: true },
  { id: "add-port", name: "Dedicated Port (25565)", price: 250, description: "Guarantees default Minecraft port allocation.", active: true },
  { id: "add-ddos", name: "DDoS Premium Shield", price: 200, description: "Advanced L4/L7 custom scrubbing mapping.", active: true },
  { id: "add-priority", name: "Priority SLA Support", price: 100, description: "Fastest response ticket queues (under 30 mins).", active: true },
  { id: "add-backups", name: "Automatic Backups", price: 100, description: "Daily off-site snapshots retained for 7 days.", active: true }
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
    const snapshot = await db.collection(collectionName).get();
    if (snapshot.empty) {
      const batch = db.batch();
      defaults.forEach((item: any) => {
        const docRef = db.collection(collectionName).doc(item.id);
        batch.set(docRef, item);
      });
      await batch.commit();
      return defaults;
    }
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as any));
  }

  /**
   * Helper to find a plan by ID from the plans collection
   */
  async function findPlanById(planId: string): Promise<any | null> {
    const snapshot = await db.collection("plans").get();
    const plans = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return plans.find((p: any) => p.id === planId) || null;
  }

  /**
   * GET /api/checkout/config
   * Retrieves checkout configuration parameters dynamically
   */
  router.get("/config", async (req, res) => {
    try {
      const locations = await getOrSeedCollection("checkout_locations", DEFAULT_LOCATIONS);
      const software = await getOrSeedCollection("checkout_software", DEFAULT_SOFTWARE);
      const addons = await getOrSeedCollection("checkout_addons", DEFAULT_ADDONS);
      const cycles = await getOrSeedCollection("checkout_cycles", DEFAULT_CYCLES);

      res.json({
        success: true,
        locations: locations.filter((l: any) => l.active),
        software: software.filter((s: any) => s.active),
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
    const { planId, billingCycle, selectedAddons } = req.body;
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

      // 3. Fetch add-ons price
      const allAddons = await getOrSeedCollection("checkout_addons", DEFAULT_ADDONS);
      let addonsTotal = 0;
      (selectedAddons || []).forEach((addonId: string) => {
        const add = allAddons.find((a: any) => a.id === addonId);
        if (add) {
          addonsTotal += add.price * months;
        }
      });

      // 4. Calculate total
      const subtotal = baseSubtotal + addonsTotal;
      const discountAmount = baseSubtotal * cycle.discount;
      const total = subtotal - discountAmount;

      res.json({
        success: true,
        calculation: {
          basePrice,
          months,
          baseSubtotal,
          addonsTotal,
          subtotal,
          discountAmount,
          discountPct: cycle.discount * 100,
          total,
          recurringPrice: basePrice + (selectedAddons || []).map((addonId: string) => {
            return allAddons.find((a: any) => a.id === addonId)?.price || 0;
          }).reduce((acc: number, curr: number) => acc + curr, 0)
        }
      });
    } catch (err: any) {
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
      selectedAddons 
    } = req.body;

    if (!planId || !serverName || !billingCycle || !locationId || !softwareId || !version) {
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

      // 3. Validate and calculate add-ons
      const allAddons = await getOrSeedCollection("checkout_addons", DEFAULT_ADDONS);
      let addonsTotal = 0;
      const verifiedAddons: any[] = [];
      (selectedAddons || []).forEach((addonId: string) => {
        const add = allAddons.find((a: any) => a.id === addonId);
        if (add) {
          addonsTotal += add.price * months;
          verifiedAddons.push({ id: add.id, name: add.name, price: add.price });
        }
      });

      // 4. Validate location & software options
      const locations = await getOrSeedCollection("checkout_locations", DEFAULT_LOCATIONS);
      const targetLocation = locations.find((l: any) => l.id === locationId);
      if (!targetLocation) return res.status(400).json({ error: "Invalid location selection." });

      const softwares = await getOrSeedCollection("checkout_software", DEFAULT_SOFTWARE);
      const targetSoftware = softwares.find((s: any) => s.id === softwareId);
      if (!targetSoftware) return res.status(400).json({ error: "Invalid software selection." });
      if (!targetSoftware.versions.includes(version)) return res.status(400).json({ error: "Invalid version selection." });

      // 5. Finalize calculation
      const subtotal = baseSubtotal + addonsTotal;
      const discountAmount = baseSubtotal * cycle.discount;
      const finalPrice = subtotal - discountAmount;

      // Generate unique record keys
      const orderId = "ORD-" + crypto.randomUUID().substring(0, 8);
      const invoiceId = "INV-" + crypto.randomUUID().substring(0, 8);
      const serviceId = "SRV-" + crypto.randomUUID().substring(0, 8);

      // 6. Save service configuration record (Pending Payment)
      await queryRun(
        `INSERT INTO services (id, userId, planId, name, status, price, billingCycle, location, software, version, addons) 
         VALUES (?, ?, ?, ?, 'Pending Payment', ?, ?, ?, ?, ?, ?)`,
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
          JSON.stringify(verifiedAddons)
        ]
      );

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

  return router;
}
