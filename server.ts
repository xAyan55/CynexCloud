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
import { securityHeaders, sanitizeInput } from "./server/middleware/security";
import { queryGet, queryRun, queryAll } from "./server/db/database";
import { enqueueProvisioningJob } from "./server/services/queueService";
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
  app.use(express.json());
  app.use(cookieParser());
  app.use(securityHeaders);
  app.use(sanitizeInput);

  app.use("/api/auth", authRouter);
  app.use("/api/panel", panelRouter);
  app.use("/api/tickets", ticketRouter);
  app.use("/api/api-keys", apiKeyRouter);
  app.use("/api/admin", adminRouter);
  
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
      const snapshot = await db.collection("plans").get();
      if (snapshot.empty) {
        const minecraftPlans = config.minecraftPlans.map((p: any) => ({ 
          ...p, 
          category: 'minecraft',
          storage: p.disk,
          price_numeric: parseFloat(p.price.match(/[0-9.]+/)?.[0] || "0")
        }));
        const vpsPlans = [
          {
            id: "vps-dev",
            name: "Cloud Dev",
            price: "750",
            price_numeric: 750,
            originalPrice: "1000",
            description: "An affordable, dedicated environment for testing, sandboxing, and lightweight applications.",
            ram: "2GB",
            cpu: "1 vCore",
            storage: "40GB NVMe",
            features: ["KVM Virtualization", "Root Access", "Dedicated IP"],
            popular: false,
            discountBadge: "25% OFF",
            category: "vps"
          },
          {
            id: "vps-start",
            name: "Cloud Start",
            price: "1200",
            price_numeric: 1200,
            originalPrice: "1600",
            description: "Ideal for small projects, personal websites, or lightweight development environments.",
            ram: "4GB",
            cpu: "2 vCores",
            storage: "80GB NVMe",
            features: ["KVM Virtualization", "Root Access", "Dedicated IP"],
            popular: false,
            discountBadge: "25% OFF",
            category: "vps"
          },
          {
            id: "vps-pro",
            name: "Cloud Pro",
            price: "2400",
            price_numeric: 2400,
            originalPrice: "3200",
            description: "High-performance VPS for growing applications and production workloads.",
            ram: "8GB",
            cpu: "4 vCores",
            storage: "160GB NVMe",
            features: ["KVM Virtualization", "Root Access", "Snapshot Backups"],
            popular: true,
            popularText: "MOST POPULAR CHOICE",
            discountBadge: "25% OFF",
            category: "vps"
          },
          {
            id: "vps-ultra",
            name: "Cloud Ultra",
            price: "4800",
            price_numeric: 4800,
            originalPrice: "6400",
            description: "Enterprise-grade resources for high-traffic sites and complex infrastructures.",
            ram: "16GB",
            cpu: "8 vCores",
            storage: "320GB NVMe",
            features: ["KVM Virtualization", "Root Access", "Daily Backups"],
            popular: false,
            discountBadge: "25% OFF",
            category: "vps"
          },
          {
            id: "vps-extreme",
            name: "Cloud Extreme",
            price: "9600",
            price_numeric: 9600,
            originalPrice: "12000",
            description: "Ultrafast high-resource cluster nodes for maximum demanding workloads.",
            ram: "32GB",
            cpu: "16 vCores",
            storage: "640GB NVMe",
            features: ["KVM Virtualization", "Root Access", "Premium 10Gbps Uplink", "Daily Backups"],
            popular: false,
            discountBadge: "20% OFF",
            category: "vps"
          }
        ];
        const discordPlans = [
          {
            id: "bot-micro",
            name: "Bot Micro",
            price: "120",
            price_numeric: 120,
            originalPrice: "200",
            description: "The lightest setup for background tasks and single-channel helper bots.",
            ram: "256MB",
            cpu: "0.25 vCore",
            storage: "2GB SSD",
            features: ["Node.js/Python/Go", "99.9% Uptime"],
            popular: false,
            discountBadge: "40% OFF",
            category: "discord"
          },
          {
            id: "bot-starter",
            name: "Bot Starter",
            price: "240",
            price_numeric: 240,
            originalPrice: "400",
            description: "Perfect for small community bots and simple automation tasks.",
            ram: "512MB",
            cpu: "0.5 vCore",
            storage: "5GB SSD",
            features: ["Node.js/Python/Go", "99.9% Uptime"],
            popular: false,
            discountBadge: "40% OFF",
            category: "discord"
          },
          {
            id: "bot-advanced",
            name: "Bot Advanced",
            price: "480",
            price_numeric: 480,
            originalPrice: "800",
            description: "Optimized for large servers with many active users and complex commands.",
            ram: "1GB",
            cpu: "1 vCore",
            storage: "10GB SSD",
            features: ["Node.js/Python/Go", "Auto-Restart"],
            popular: true,
            popularText: "RECOMMENDED FOR PROS",
            discountBadge: "40% OFF",
            category: "discord"
          },
          {
            id: "bot-enterprise",
            name: "Bot Enterprise",
            price: "1000",
            price_numeric: 1000,
            originalPrice: "1600",
            description: "Maximum performance for global bots serving millions of users.",
            ram: "2GB",
            cpu: "2 vCores",
            storage: "20GB SSD",
            features: ["Node.js/Python/Go", "Custom Database"],
            popular: false,
            discountBadge: "35% OFF",
            category: "discord"
          },
          {
            id: "bot-extreme",
            name: "Bot Extreme",
            price: "1800",
            price_numeric: 1800,
            originalPrice: "2500",
            description: "Premium hosting for top-tier verified Discord bots with high-intensity command queries.",
            ram: "4GB",
            cpu: "4 vCores",
            storage: "40GB SSD",
            features: ["Node.js/Python/Go", "Custom Redis/Database", "Priority 24/7 Support"],
            popular: false,
            discountBadge: "28% OFF",
            category: "discord"
          }
        ];

        const allInitialPlans = [...minecraftPlans, ...vpsPlans, ...discordPlans];
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

  app.post("/api/invoices/:id/pay", checkAuth, async (req: any, res) => {
    const { id } = req.params;
    try {
      const invoice = await queryGet<any>(
        `SELECT * FROM invoices WHERE id = ? AND userId = ?`,
        [id, req.user.userId]
      );

      if (!invoice) {
        return res.status(404).json({ error: "Invoice record not found." });
      }

      if (invoice.status === "Paid") {
        return res.status(400).json({ error: "Invoice has already been paid." });
      }

      // Mark Invoice as Paid
      await queryRun(`UPDATE invoices SET status = 'Paid' WHERE id = ?`, [id]);
      
      // Update Order Status
      await queryRun(`UPDATE orders SET status = 'Paid' WHERE id = ?`, [invoice.orderId]);

      // Create payment notification record
      await queryRun(
        `INSERT INTO notifications (id, userId, title, message) VALUES (?, ?, 'Invoice Paid', ?)`,
        ["notif-" + crypto.randomUUID(), req.user.userId, `Invoice ${id} has been paid successfully.`]
      );

      // Get associated service
      const service = await queryGet<any>(
        `SELECT s.id FROM services s
         INNER JOIN orders o ON s.planId = o.planId
         WHERE o.id = ? AND s.userId = ? AND s.status = 'Pending Payment' LIMIT 1`,
        [invoice.orderId, req.user.userId]
      );

      if (service) {
        // Enqueue Async Provisioning Job!
        await enqueueProvisioningJob(service.id);
      }

      res.json({ success: true, message: "Payment processed successfully. Service provisioning queued." });
    } catch (err: any) {
      console.error("Payment processing error:", err);
      res.status(500).json({ error: "Payment processing failed." });
    }
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
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
