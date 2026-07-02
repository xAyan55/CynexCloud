import { Router, Response } from "express";
import crypto from "crypto";
import { queryGet, queryRun, queryAll } from "../db/database";
import { requireAuth as checkAuth } from "./authRoutes";
import { getPanelConfig } from "../services/pterodactylService";
import { createOxaPayInvoice, verifyOxaPayTransaction } from "../payments/providers/oxapay/oxapayService";
import { enqueueProvisioningJob } from "../services/queueService";

const router = Router();

const getOxaPayCredentials = async () => {
  const merchantKey = process.env.OXAPAY_MERCHANT_KEY || 
    (await queryGet<{ value: string }>("SELECT value FROM settings WHERE key = 'oxapay_merchant_key'"))?.value || "";
  
  const webhookSecret = process.env.OXAPAY_WEBHOOK_SECRET || "";
  
  const callbackUrl = process.env.OXAPAY_CALLBACK_URL || "https://cynexcloud.eu.cc/api/payments/oxapay/callback";
  const returnUrl = process.env.OXAPAY_RETURN_URL || "https://cynexcloud.eu.cc/dashboard/invoices";

  console.log(`[OxaPay Credentials] merchantKey: ${merchantKey ? "set (" + merchantKey.substring(0, 4) + "****)" : "MISSING"}, callbackUrl: ${callbackUrl}, returnUrl: ${returnUrl}`);
  if (!merchantKey) {
    console.warn("[OxaPay Credentials] Merchant key is empty. Check OXAPAY_MERCHANT_KEY env var or oxapay_merchant_key in settings table.");
  }

  return { merchantKey, webhookSecret, callbackUrl, returnUrl };
};

/**
 * GET /api/payments/history
 * Returns payment history logs for the current user
 */
router.get("/history", checkAuth, async (req: any, res: Response) => {
  try {
    const history = await queryAll(
      `SELECT id as invoiceId, paymentId, paymentProvider, paymentAmount, paymentCurrency, paymentStatus, transactionHash, paidAt, createdAt 
       FROM invoices 
       WHERE userId = ? AND paymentId IS NOT NULL 
       ORDER BY createdAt DESC`,
      [req.user.userId]
    );
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ error: "Failed to load payment history logs." });
  }
});

/**
 * POST /api/payments/oxapay/create
 * Creates an OxaPay checkout session for an unpaid invoice
 */
router.post("/oxapay/create", checkAuth, async (req: any, res: Response) => {
  const { invoiceId } = req.body;
  if (!invoiceId) {
    return res.status(400).json({ error: "invoiceId is a required parameter." });
  }

  try {
    const invoice = await queryGet<any>(
      `SELECT * FROM invoices WHERE id = ? AND userId = ?`,
      [invoiceId, req.user.userId]
    );

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found." });
    }

    if (invoice.status === "Paid") {
      return res.status(400).json({ error: "Invoice has already been paid." });
    }

    const creds = await getOxaPayCredentials();
    if (!creds.merchantKey) {
      return res.status(500).json({ error: "OxaPay payment provider is not configured." });
    }

    console.log(`[Payment] Creating OxaPay invoice for Cynex invoice ${invoiceId} (Amount: ${invoice.amount} INR)...`);

    // Call OxaPay Merchant API — correct endpoint: POST /merchants/request
    const response = await createOxaPayInvoice(
      creds.merchantKey,
      invoiceId,
      invoice.amount,
      "INR",
      creds.callbackUrl,
      creds.returnUrl,
      req.user.email,
      30
    );

    if (response.result !== 100) {
      const errMsg = response.message || response.error?.message || "OxaPay rejected the invoice request";
      console.error(`[Payment] OxaPay invoice rejected: result=${response.result}, message=${errMsg}`);
      throw new Error(errMsg);
    }

    const expiryTime = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 mins lifetime

    // Save payment metadata to invoice
    await queryRun(
      `UPDATE invoices 
       SET paymentProvider = 'OxaPay', 
           paymentId = ?, 
           paymentStatus = 'Pending', 
           paymentCurrency = ?, 
           paymentAmount = ?, 
           expiresAt = ? 
       WHERE id = ?`,
      [response.trackId, "INR", invoice.amount, expiryTime, invoiceId]
    );

    // Write real log
    console.log(`[Payment] OxaPay payment request created. InvoiceID: ${invoiceId}, TrackID: ${response.trackId}`);

    res.json({
      success: true,
      payUrl: response.payUrl,
      paymentId: response.trackId,
      amount: invoice.amount,
      currency: "INR",
      invoiceId
    });
  } catch (err: any) {
    const httpStatus = err.response?.status;
    const oxaPayMessage = err.response?.data?.message || err.response?.data?.error?.message || "";
    const axiosMessage = err.message || "";

    console.error(`[Payment Error] Checkout failed:
      HTTP Status: ${httpStatus || "N/A"}
      OxaPay message: ${oxaPayMessage}
      Axios error: ${axiosMessage}
      InvoiceId: ${invoiceId}`);

    // Build a user-friendly message without exposing raw API errors
    let userMessage: string;
    if (httpStatus === 401) {
      userMessage = "Unable to create a payment invoice because the payment provider rejected the authentication request. Please verify your OxaPay merchant key is correct and active.";
    } else if (httpStatus === 404) {
      userMessage = "The payment provider endpoint could not be reached. Please verify the OxaPay API URL configuration.";
    } else if (httpStatus === 422) {
      userMessage = "The payment request was rejected due to invalid parameters. Please contact support.";
    } else if (oxaPayMessage) {
      userMessage = `Payment provider error: ${oxaPayMessage}`;
    } else {
      userMessage = "The payment gateway could not be reached. Please try again later.";
    }

    res.status(500).json({ error: userMessage });
  }
});

/**
 * POST /api/payments/oxapay/webhook
 * Handles transaction status callbacks from OxaPay
 */
const handleWebhook = async (req: any, res: Response) => {
  const rawBody = req.rawBody || "";
  const signature = req.headers["hmac"] || req.headers["HMAC"];
  
  console.log(`[Payment] Webhook callback received from OxaPay. Signature header: ${signature}`);

  try {
    const creds = await getOxaPayCredentials();
    if (!creds.merchantKey) {
      console.error("[Payment Error] Webhook received but Merchant Key is not configured.");
      return res.status(500).send("Provider not configured");
    }

    // Verify authenticity using HMAC SHA512 of raw request body
    const calculated = crypto.createHmac("sha512", creds.merchantKey).update(rawBody).digest("hex");
    if (calculated !== signature) {
      console.warn("[Payment Warning] Webhook signature verification failed. Mismatched HMAC.");
      return res.status(400).send("Signature verification failed");
    }

    const payload = req.body;
    const invoiceId = payload.orderId;
    const trackId = payload.trackId;
    const status = payload.status;
    const txId = payload.txId;

    if (!invoiceId || !trackId) {
      return res.status(400).send("Malformed payload");
    }

    // Load invoice
    const invoice = await queryGet<any>(`SELECT * FROM invoices WHERE id = ?`, [invoiceId]);
    if (!invoice) {
      console.warn(`[Payment Warning] Webhook received for non-existent invoice ${invoiceId}`);
      return res.status(404).send("Invoice not found");
    }

    // Idempotency: Ignore repeated webhook events if invoice already completed
    if (invoice.status === "Paid") {
      console.log(`[Payment] Webhook ignored for already paid invoice ${invoiceId}`);
      return res.send("ok");
    }

    // Double-check: Query status directly from OxaPay API to prevent payload spoofing
    const inquiry = await verifyOxaPayTransaction(creds.merchantKey, trackId);
    if (inquiry.result !== 100) {
      console.warn(`[Payment Warning] Inquiry verification failed for trackId ${trackId}: ${inquiry.message}`);
      return res.status(400).send("Verification inquiry failed");
    }

    const verifiedStatus = inquiry.status; // Paid, Confirming, Waiting, Expired, Cancelled, Failed, Refunded
    const blockchainTx = inquiry.txId || txId || "";

    console.log(`[Payment] Verified payment status for invoice ${invoiceId}: ${verifiedStatus}`);

    // Update invoice log details
    await queryRun(
      `UPDATE invoices 
       SET paymentStatus = ?, 
           transactionHash = ?, 
           lastWebhookEvent = ?, 
           confirmationCount = ? 
       WHERE id = ?`,
      [verifiedStatus, blockchainTx, JSON.stringify(payload), inquiry.confirmations || 0, invoiceId]
    );

    // If payment is fully completed
    if (verifiedStatus === "Paid" || verifiedStatus === "Success") {
      // Mark Invoice as Paid
      await queryRun(
        `UPDATE invoices SET status = 'Paid', paidAt = CURRENT_TIMESTAMP, callbackVerified = 1 WHERE id = ?`,
        [invoiceId]
      );
      
      // Update Order Status
      await queryRun(
        `UPDATE orders SET status = 'Paid', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [invoice.orderId]
      );

      // Resolve service record
      const service = await queryGet<any>(
        `SELECT s.id, s.name FROM services s
         INNER JOIN orders o ON s.planId = o.planId
         WHERE o.id = ? AND s.userId = ? AND s.status = 'Pending Payment' LIMIT 1`,
        [invoice.orderId, invoice.userId]
      );

      if (service) {
        console.log(`[Payment] Invoice ${invoiceId} paid. Enqueueing provisioning queue for service ${service.id} (${service.name}).`);
        await enqueueProvisioningJob(service.id);
      }
    } else if (verifiedStatus === "Expired" || verifiedStatus === "Failed" || verifiedStatus === "Cancelled") {
      // Mark Invoice as Expired/Failed
      await queryRun(
        `UPDATE invoices SET status = 'Cancelled' WHERE id = ?`,
        [invoiceId]
      );
      await queryRun(
        `UPDATE orders SET status = 'Cancelled', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [invoice.orderId]
      );
      await queryRun(
        `UPDATE services SET status = 'Failed', updatedAt = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM services WHERE planId = (SELECT planId FROM orders WHERE id = ?) AND userId = ? LIMIT 1)`,
        [invoice.orderId, invoice.userId]
      );
    }

    res.send("ok");
  } catch (err: any) {
    console.error(`[Payment Webhook Error]:`, err.message);
    res.status(500).send("Webhook processing error");
  }
};

router.post("/oxapay/webhook", handleWebhook);
router.post("/oxapay/callback", handleWebhook);

/**
 * GET /api/payments/:invoiceId/status
 * Returns current payment gateway status for frontend polling
 */
router.get("/:invoiceId/status", checkAuth, async (req: any, res: Response) => {
  const { invoiceId } = req.params;
  try {
    const invoice = await queryGet<any>(
      `SELECT status, paymentStatus, transactionHash, paidAt, expiresAt FROM invoices WHERE id = ? AND userId = ?`,
      [invoiceId, req.user.userId]
    );

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found." });
    }

    res.json({
      success: true,
      status: invoice.status, // Paid, Unpaid, Cancelled
      paymentStatus: invoice.paymentStatus || "Waiting for Payment",
      transactionHash: invoice.transactionHash || "",
      paidAt: invoice.paidAt || null,
      expiresAt: invoice.expiresAt || null
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to query status." });
  }
});

export default router;
