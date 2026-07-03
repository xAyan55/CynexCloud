import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import fs from "fs";
import cookieParser from "cookie-parser";
import { dbInit } from "./server/db/database";
import authRouter, { requireAuth } from "./server/routes/authRoutes";
import panelRouter from "./server/routes/panelRoutes";
import ticketRouter from "./server/routes/ticketRoutes";
import apiKeyRouter from "./server/routes/apiKeyRoutes";
import adminRouter from "./server/routes/adminRoutes";
import paymentRouter from "./server/routes/paymentRoutes";
import createCheckoutRouter from "./server/routes/checkoutRoutes";
import { securityHeaders, sanitizeInput } from "./server/middleware/security";
import { queryGet, queryRun, queryAll } from "./server/db/database";
import { enqueueProvisioningJob } from "./server/services/queueService";
import { getCynexVMConfig } from "./server/services/cynexvmService";
import cynexvmRouter from "./server/routes/cynexvmRoutes";
import { initializeApp as initializeClientApp } from "firebase/app";
import { 
  getFirestore as getClientFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  writeBatch,
  serverTimestamp,
  DocumentReference
} from "firebase/firestore";

// Load app config
const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'config.json'), 'utf8'));

// Load firebase config from config.json
const firebaseConfig = config.firebase;

// Initialize Firebase Client SDK
const clientApp = initializeClientApp(firebaseConfig);
const clientDb = getClientFirestore(clientApp, firebaseConfig.firestoreDatabaseId);

// Simple document reference wrapper to mimic admin docRef
class DocRefWrapper {
  constructor(public docRef: DocumentReference) {}
  get id() { return this.docRef.id; }
  async set(data: any) {
    await setDoc(this.docRef, data, { merge: true });
  }
  async delete() {
    await deleteDoc(this.docRef);
  }
}

class QueryWrapper {
  private constraints: any[] = [];
  constructor(private collectionPath: string) {}

  where(field: string, op: string, value: any) {
    this.constraints.push(where(field, op as any, value));
    return this;
  }

  async get() {
    const q = query(collection(clientDb, this.collectionPath), ...this.constraints);
    const querySnapshot = await getDocs(q);
    return {
      empty: querySnapshot.empty,
      docs: querySnapshot.docs.map(d => ({
        id: d.id,
        data() { return d.data(); }
      }))
    };
  }
}

const db = {
  collection(collectionPath: string) {
    return {
      doc(docId?: string) {
        const docRef = docId ? doc(clientDb, collectionPath, docId) : doc(collection(clientDb, collectionPath));
        return new DocRefWrapper(docRef);
      },
      async get() {
        const querySnapshot = await getDocs(collection(clientDb, collectionPath));
        return {
          empty: querySnapshot.empty,
          docs: querySnapshot.docs.map(d => ({
            id: d.id,
            data() { return d.data(); }
          }))
        };
      },
      where(field: string, op: string, value: any) {
        const queryWrapper = new QueryWrapper(collectionPath);
        return queryWrapper.where(field, op, value);
      },
      async add(data: any) {
        const docRef = await addDoc(collection(clientDb, collectionPath), data);
        return new DocRefWrapper(docRef);
      }
    };
  },
  batch() {
    const batchInstance = writeBatch(clientDb);
    return {
      set(docRefWrapper: DocRefWrapper, data: any) {
        batchInstance.set(docRefWrapper.docRef, data);
      },
      async commit() {
        await batchInstance.commit();
      }
    };
  }
};

const FieldValue = {
  serverTimestamp() {
    return serverTimestamp();
  }
};

async function startServer() {
  await dbInit();
  const app = express();
  app.use(express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    }
  }));
  app.use(cookieParser());
  app.use(securityHeaders);
  app.use(sanitizeInput);

  app.use("/api/auth", authRouter);
  app.use("/api/panel", panelRouter);
  app.use("/api/tickets", ticketRouter);
  app.use("/api/api-keys", apiKeyRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/payments", paymentRouter);
  app.use("/api/checkout", createCheckoutRouter(db));
  app.use("/api/cynexvm", cynexvmRouter);
  
  // Public settings (no auth required)
  app.get("/api/settings/public", async (req, res) => {
    try {
      const social = await queryGet<{ value: string }>("SELECT value FROM settings WHERE key = 'social_login_provider'");
      res.json({ social_login_provider: social?.value || "none" });
    } catch {
      res.json({ social_login_provider: "none" });
    }
  });

  // Discord OAuth redirect
  app.get("/api/auth/discord", async (req, res) => {
    try {
      const clientId = await queryGet<{ value: string }>("SELECT value FROM settings WHERE key = 'discord_client_id'");
      if (!clientId?.value) {
        return res.redirect("/login?error=discord_not_configured");
      }
      const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/discord/callback`;
      const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId.value}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20email`;
      res.redirect(url);
    } catch {
      res.redirect("/login?error=discord_error");
    }
  });

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Middleware to check auth
  const checkAuth = requireAuth;

  // Middleware to check admin
  const checkAdmin = (req: any, res: any, next: any) => {
    requireAuth(req, res, () => {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Forbidden. Admin access required." });
      }
      next();
    });
  };

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // PayPal Routes
  // Plan Routes
  app.get("/api/plans", async (req, res) => {
    try {
      // Define VPS seed plans (used both for initial seed and as fallback when Firestore lacks them)
      const vpsSeedPlans = [
        { id: "bronze", name: "Bronze", price: "₹99", price_numeric: 99, description: "Entry-level VPS for lightweight tasks and personal projects.", ram: "4GB", cpu: "1 Core", storage: "20GB SSD", cpuCores: 1, memoryMb: 4096, storageGb: 20, features: ["KVM Virtualization", "Root Access", "Dedicated IP", "SSD Storage"], popular: false, image: "/images/vps-imgs/bronze.png", category: "vps" },
        { id: "silver", name: "Silver", price: "₹199", price_numeric: 199, description: "Great value for small websites and development environments.", ram: "8GB", cpu: "2 Core", storage: "40GB SSD", cpuCores: 2, memoryMb: 8192, storageGb: 40, features: ["KVM Virtualization", "Root Access", "Dedicated IP", "SSD Storage"], popular: false, image: "/images/vps-imgs/silver.png", category: "vps" },
        { id: "platinum", name: "Platinum", price: "₹299", price_numeric: 299, description: "Balanced performance for growing applications.", ram: "12GB", cpu: "3 Core", storage: "60GB SSD", cpuCores: 3, memoryMb: 12288, storageGb: 60, features: ["KVM Virtualization", "Root Access", "Dedicated IP", "Snapshot Backups"], popular: false, image: "/images/vps-imgs/platinum.png", category: "vps" },
        { id: "gold", name: "Gold", price: "₹399", price_numeric: 399, description: "High-performance VPS for production workloads.", ram: "16GB", cpu: "4 Core", storage: "80GB SSD", cpuCores: 4, memoryMb: 16384, storageGb: 80, features: ["KVM Virtualization", "Root Access", "Dedicated IP", "Snapshot Backups"], popular: true, popularText: "RECOMMENDED", image: "/images/vps-imgs/gold.png", category: "vps" },
        { id: "diamond", name: "Diamond", price: "₹499", price_numeric: 499, description: "Premium resources for demanding applications.", ram: "20GB", cpu: "5 Core", storage: "100GB SSD", cpuCores: 5, memoryMb: 20480, storageGb: 100, features: ["KVM Virtualization", "Root Access", "Dedicated IP", "Daily Backups"], popular: false, image: "/images/vps-imgs/diamond.png", category: "vps" },
        { id: "crystal", name: "Crystal", price: "₹599", price_numeric: 599, description: "Enterprise-grade power for high-traffic platforms.", ram: "24GB", cpu: "6 Core", storage: "120GB SSD", cpuCores: 6, memoryMb: 24576, storageGb: 120, features: ["KVM Virtualization", "Root Access", "Dedicated IP", "Daily Backups", "Priority Support"], popular: false, image: "/images/vps-imgs/crystal.png", category: "vps" },
        { id: "amber", name: "Amber", price: "₹699", price_numeric: 699, description: "Maximum resources for the most demanding workloads.", ram: "28GB", cpu: "7 Core", storage: "140GB SSD", cpuCores: 7, memoryMb: 28672, storageGb: 140, features: ["KVM Virtualization", "Root Access", "Dedicated IP", "Daily Backups", "Priority Support", "10Gbps Uplink"], popular: false, image: "/images/vps-imgs/amber.png", category: "vps" }
      ];

      const snapshot = await db.collection("plans").get();
      if (snapshot.empty) {
        const minecraftPlans = config.minecraftPlans.map((p: any) => ({ 
          ...p, 
          category: 'minecraft',
          storage: p.disk,
          price_numeric: parseFloat(p.price.match(/[0-9.]+/)?.[0] || "0")
        }));
        const discordPlans = [
          { id: "bot-micro", name: "Bot Micro", price: "₹120", price_numeric: 120, originalPrice: "₹200", description: "The lightest setup for background tasks and single-channel helper bots.", ram: "256MB", cpu: "0.25 vCore", storage: "2GB SSD", features: ["Node.js/Python/Go", "99.9% Uptime"], popular: false, discountBadge: "40% OFF", category: "discord" },
          { id: "bot-starter", name: "Bot Starter", price: "₹240", price_numeric: 240, originalPrice: "₹400", description: "Perfect for small community bots and simple automation tasks.", ram: "512MB", cpu: "0.5 vCore", storage: "5GB SSD", features: ["Node.js/Python/Go", "99.9% Uptime"], popular: false, discountBadge: "40% OFF", category: "discord" },
          { id: "bot-advanced", name: "Bot Advanced", price: "₹480", price_numeric: 480, originalPrice: "₹800", description: "Optimized for large servers with many active users and complex commands.", ram: "1GB", cpu: "1 vCore", storage: "10GB SSD", features: ["Node.js/Python/Go", "Auto-Restart"], popular: true, popularText: "RECOMMENDED FOR PROS", discountBadge: "40% OFF", category: "discord" },
          { id: "bot-enterprise", name: "Bot Enterprise", price: "₹1000", price_numeric: 1000, originalPrice: "₹1600", description: "Maximum performance for global bots serving millions of users.", ram: "2GB", cpu: "2 vCores", storage: "20GB SSD", features: ["Node.js/Python/Go", "Custom Database"], popular: false, discountBadge: "35% OFF", category: "discord" },
          { id: "bot-extreme", name: "Bot Extreme", price: "₹1800", price_numeric: 1800, originalPrice: "₹2500", description: "Premium hosting for top-tier verified Discord bots with high-intensity command queries.", ram: "4GB", cpu: "4 vCores", storage: "40GB SSD", features: ["Node.js/Python/Go", "Custom Redis/Database", "Priority 24/7 Support"], popular: false, discountBadge: "28% OFF", category: "discord" }
        ];

        const allInitialPlans = [...minecraftPlans, ...vpsSeedPlans, ...discordPlans];
        const batch = db.batch();
        allInitialPlans.forEach(p => {
          const docRef = db.collection("plans").doc(p.id);
          batch.set(docRef, p);
        });
        await batch.commit();
      }
      
      const updatedSnapshot = await db.collection("plans").get();
      const plans = updatedSnapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data, storage: data.storage || data.disk };
      });

      // Merge in VPS seed plans if any are missing from Firestore (e.g. old DB has vps-dev but not bronze)
      const existingIds = new Set(plans.map((p: any) => p.id));
      vpsSeedPlans.forEach(vpsPlan => {
        if (!existingIds.has(vpsPlan.id)) {
          plans.push(vpsPlan);
        }
      });

      plans.sort((a: any, b: any) => (a.price_numeric || 0) - (b.price_numeric || 0));
      res.json(plans);
    } catch (error: any) {
      console.error("Fetch plans error:", error);
      res.status(500).json({ error: "Failed to fetch plans" });
    }
  });

  app.post("/api/admin/plans", checkAdmin, async (req, res) => {
    try {
      const plan = req.body;
      if (!plan.id) return res.status(400).json({ error: "Plan ID is required" });
      await db.collection("plans").doc(plan.id).set(plan);
      res.json(plan);
    } catch (error: any) {
      console.error("Create plan error:", error);
      res.status(500).json({ error: "Failed to create/update plan" });
    }
  });

  app.delete("/api/admin/plans/:id", checkAdmin, async (req, res) => {
    try {
      await db.collection("plans").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete plan error:", error);
      res.status(500).json({ error: "Failed to delete plan" });
    }
  });

  // Business Services Portal Routes
  app.post("/api/orders", checkAuth, async (req: any, res) => {
    const { planId, serviceName } = req.body;
    if (!planId || !serviceName) {
      return res.status(400).json({ error: "planId and serviceName are required fields." });
    }

    try {
      // Fetch plan price
      const snapshot = await db.collection("plans").get();
      const plan: any = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)).find((p: any) => p.id === planId);

      if (!plan) {
        return res.status(404).json({ error: "Plan configuration not found." });
      }

      const price = parseFloat(plan.price_numeric || plan.price || "0");
      const orderId = "ORD-" + crypto.randomUUID().substring(0, 8);
      const invoiceId = "INV-" + crypto.randomUUID().substring(0, 8);
      const serviceId = "SRV-" + crypto.randomUUID().substring(0, 8);

      // Create service record (Pending Payment)
      await queryRun(
        `INSERT INTO services (id, userId, planId, name, status, price) VALUES (?, ?, ?, ?, 'Pending Payment', ?)`,
        [serviceId, req.user.userId, planId, serviceName, price]
      );

      // Create order record
      await queryRun(
        `INSERT INTO orders (id, userId, planId, status, price) VALUES (?, ?, ?, 'Pending Payment', ?)`,
        [orderId, req.user.userId, planId, price]
      );

      // Create invoice record
      await queryRun(
        `INSERT INTO invoices (id, orderId, userId, amount, status) VALUES (?, ?, ?, ?, 'Unpaid')`,
        [invoiceId, orderId, req.user.userId, price]
      );

      // Create notification record
      await queryRun(
        `INSERT INTO notifications (id, userId, title, message) VALUES (?, ?, 'Invoice Generated', ?)`,
        ["notif-" + crypto.randomUUID(), req.user.userId, `Invoice ${invoiceId} generated for plan '${planId}' (${serviceName}).`]
      );

      res.json({ success: true, orderId, invoiceId, serviceId });
    } catch (err: any) {
      console.error("Order creation failed:", err);
      res.status(500).json({ error: "Failed to submit hosting service order." });
    }
  });

  app.get("/api/invoices", checkAuth, async (req: any, res) => {
    try {
      const invoices = await queryAll(
        `SELECT i.*, o.planId, o.status as orderStatus FROM invoices i
         LEFT JOIN orders o ON i.orderId = o.id
         WHERE i.userId = ? ORDER BY i.createdAt DESC`,
        [req.user.userId]
      );
      res.json({ success: true, invoices });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load invoices history." });
    }
  });

  // Legacy pay endpoint — now deprecated in favour of OxaPay gateway
  app.post("/api/invoices/:id/pay", checkAuth, async (req: any, res) => {
    return res.status(400).json({
      error: "Direct payment is no longer supported. Use the OxaPay cryptocurrency gateway via POST /api/payments/oxapay/create."
    });
  });

  app.get("/api/services", checkAuth, async (req: any, res) => {
    try {
      const services = await queryAll(
        `SELECT * FROM services WHERE userId = ? ORDER BY createdAt DESC`,
        [req.user.userId]
      );
      res.json({ success: true, services });
    } catch (err) {
      res.status(500).json({ error: "Failed to list client services." });
    }
  });

  app.get("/api/services/:id", checkAuth, async (req: any, res) => {
    const { id } = req.params;
    try {
      const service = await queryGet<any>(
        `SELECT * FROM services WHERE id = ? AND userId = ?`,
        [id, req.user.userId]
      );
      if (!service) {
        return res.status(404).json({ error: "Service subscription details not found." });
      }
      res.json({ success: true, service });
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve service details." });
    }
  });

  // Notifications API endpoints
  app.get("/api/notifications", checkAuth, async (req: any, res) => {
    try {
      const notifications = await queryAll(
        `SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 20`,
        [req.user.userId]
      );
      res.json({ success: true, notifications });
    } catch (err) {
      res.status(500).json({ error: "Failed to load account notifications." });
    }
  });

  app.post("/api/notifications/read-all", checkAuth, async (req: any, res) => {
    try {
      await queryRun(
        `UPDATE notifications SET read = 1 WHERE userId = ?`,
        [req.user.userId]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to mark notifications read." });
    }
  });

  // Announcements API endpoints
  app.get("/api/announcements", checkAuth, async (req, res) => {
    try {
      const announcements = await queryAll(
        `SELECT * FROM announcements ORDER BY createdAt DESC`
      );
      res.json({ success: true, announcements });
    } catch (err) {
      res.status(500).json({ error: "Failed to load system announcements." });
    }
  });

  app.post("/api/admin/announcements", checkAdmin, async (req, res) => {
    const { title, content, category } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "title and content are required fields." });
    }
    try {
      const id = "ann-" + crypto.randomUUID().substring(0, 8);
      await queryRun(
        `INSERT INTO announcements (id, title, content, category) VALUES (?, ?, ?, ?)`,
        [id, title, content, category || "Platform"]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to publish system announcement." });
    }
  });

  app.delete("/api/admin/announcements/:id", checkAdmin, async (req, res) => {
    try {
      await queryRun(
        `DELETE FROM announcements WHERE id = ?`,
        [req.params.id]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(550).json({ error: "Failed to delete announcement." });
    }
  });

  // Coupon Routes
  app.get("/api/coupons/validate", checkAuth, async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "Coupon code is required" });

    try {
      const snapshot = await db.collection("coupons")
        .where("code", "==", code.toString().toUpperCase())
        .where("active", "==", true)
        .get();

      if (snapshot.empty) {
        return res.status(404).json({ error: "Invalid or inactive coupon code" });
      }

      const coupon = snapshot.docs[0].data();
      
      // Check expiry
      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return res.status(400).json({ error: "Coupon has expired" });
      }

      // Check usage limits
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ error: "Coupon usage limit reached" });
      }

      res.json({ id: snapshot.docs[0].id, ...coupon });
    } catch (error: any) {
      console.error("Validate coupon error:", error);
      res.status(500).json({ error: "Failed to validate coupon", message: error.message });
    }
  });

  app.get("/api/admin/coupons", checkAdmin, async (req, res) => {
    try {
      const snapshot = await db.collection("coupons").get();
      if (snapshot.empty) {
        // Seed initial coupons
        const initialCoupons = [
          {
            code: "WELCOME2026",
            discountType: "percentage",
            discountValue: 20,
            maxUses: 1000,
            usedCount: 0,
            active: true,
            createdAt: FieldValue.serverTimestamp()
          },
          {
            code: "CYNEX10",
            discountType: "fixed",
            discountValue: 10,
            maxUses: 500,
            usedCount: 0,
            active: true,
            createdAt: FieldValue.serverTimestamp()
          }
        ];
        const batch = db.batch();
        initialCoupons.forEach(c => {
          const docRef = db.collection("coupons").doc();
          batch.set(docRef, c);
        });
        await batch.commit();
        const newSnapshot = await db.collection("coupons").get();
        return res.json(newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
      const coupons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(coupons);
    } catch (error: any) {
      console.error("Fetch coupons error:", error);
      res.status(500).json({ error: "Failed to fetch coupons" });
    }
  });

  app.post("/api/admin/coupons", checkAdmin, async (req, res) => {
    try {
      if (!req.body.code) return res.status(400).json({ error: "Coupon code is required" });
      const coupon = {
        ...req.body,
        code: req.body.code.toUpperCase(),
        usedCount: 0,
        createdAt: FieldValue.serverTimestamp()
      };
      const docRef = await db.collection("coupons").add(coupon);
      res.json({ id: docRef.id, ...coupon });
    } catch (error: any) {
      console.error("Create coupon error:", error);
      res.status(500).json({ error: "Failed to create coupon" });
    }
  });

  app.delete("/api/admin/coupons/:id", checkAdmin, async (req, res) => {
    try {
      await db.collection("coupons").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete coupon error:", error);
      res.status(500).json({ error: "Failed to delete coupon" });
    }
  });

  // Free Instant Demo Provision Route (replaces complex Billing/PayPal)
  app.post("/api/plans/provision", async (req, res) => {
    const { userId, planId, planName, ram, cpu, storage, category } = req.body;
    
    if (!userId || !planId) {
      return res.status(400).json({ error: "userId and planId are required" });
    }

    try {
      const serverId = "SRV-" + Math.random().toString(36).substr(2, 9).toUpperCase();
      const serverData = {
        id: serverId,
        name: `${planName || "Demo"} Server`,
        planId,
        ram: ram || "N/A",
        cpu: cpu || "N/A",
        storage: storage || "N/A",
        category: category || "minecraft",
        status: "ACTIVE",
        userId,
        createdAt: FieldValue.serverTimestamp(),
      };

      // Write to servers collection
      await db.collection("servers").doc(serverId).set(serverData);

      // Add a simulated payment history record too so their profile stays fully featured!
      const paymentId = "PAY-" + Math.random().toString(36).substr(2, 9).toUpperCase();
      await db.collection("payments").doc(paymentId).set({
        orderId: paymentId,
        captureId: "CAPT-" + paymentId,
        userId,
        planId,
        amount: "0.00",
        currency: "INR",
        status: "FREE_PROVISIONED",
        createdAt: FieldValue.serverTimestamp(),
      });

      res.json({ success: true, server: serverData });
    } catch (error: any) {
      console.error("Free Provisioning Error:", error);
      res.status(500).json({ error: "Failed to provision server", details: error.message });
    }
  });


  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("Client connected to WebSocket");
    
    // Send initial data
    socket.emit("system_health", {
      cpu: Math.floor(Math.random() * 100),
      ram: Math.floor(Math.random() * 100),
      network: Math.floor(Math.random() * 100),
      timestamp: new Date().toLocaleTimeString()
    });

    // Broadcast updates every 2 seconds
    const interval = setInterval(() => {
      socket.emit("system_health", {
        cpu: Math.floor(Math.random() * 100),
        ram: Math.floor(Math.random() * 100),
        network: Math.floor(Math.random() * 100),
        timestamp: new Date().toLocaleTimeString()
      });
    }, 2000);

    socket.on("disconnect", () => {
      clearInterval(interval);
      console.log("Client disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    app.use(express.static(path.join(process.cwd(), "src", "public")));
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Cache JS/CSS/assets forever (content-hashed filenames), but NEVER cache index.html
    app.use(express.static(distPath, {
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
        if (filePath.endsWith('.xml')) {
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.setHeader('Content-Type', 'text/xml; charset=utf-8');
        }
      }
    }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
