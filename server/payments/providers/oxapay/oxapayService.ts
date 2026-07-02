import axios from "axios";

export interface OxaPayRequestPayload {
  merchant: string;
  amount: number;
  currency: string;
  orderId: string;
  callbackUrl: string;
  returnUrl: string;
  description?: string;
  email?: string;
  lifeTime?: number;
  feePaidByPayer?: number;
}

export interface OxaPayInquiryPayload {
  merchant: string;
  trackId: string;
}

const API_BASE = process.env.OXAPAY_API_URL || "https://api.oxapay.com";

function maskKey(key: string): string {
  if (key.length <= 8) return "***";
  return key.substring(0, 4) + "****" + key.substring(key.length - 4);
}

/**
 * Calls OxaPay Merchant API to generate a crypto checkout URL.
 * Endpoint: POST /merchants/request
 */
export const createOxaPayInvoice = async (
  merchantKey: string,
  invoiceId: string,
  amount: number,
  currency: string,
  callbackUrl: string,
  returnUrl: string,
  email?: string,
  lifeTimeMinutes: number = 30
) => {
  const payload: OxaPayRequestPayload = {
    merchant: merchantKey,
    amount,
    currency,
    orderId: invoiceId,
    callbackUrl,
    returnUrl,
    description: `CynexCloud Subscription Invoice ${invoiceId}`,
    lifeTime: lifeTimeMinutes,
    feePaidByPayer: 0
  };

  if (email) {
    payload.email = email;
  }

  const endpoint = `${API_BASE}/merchants/request`;

  console.log(`[OxaPay] Creating invoice...
    Endpoint: ${endpoint}
    InvoiceId: ${invoiceId}
    Amount: ${amount} ${currency}
    Merchant: ${maskKey(merchantKey)}
    Callback: ${callbackUrl}
    Return: ${returnUrl}
    Email: ${email || "not provided"}
    LifeTime: ${lifeTimeMinutes}min`);

  try {
    const response = await axios.post(endpoint, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000
    });

    console.log(`[OxaPay] Invoice response status: ${response.status}
    Body: ${JSON.stringify(response.data)}`);

    return response.data;
  } catch (err: any) {
    if (err.response) {
      console.error(`[OxaPay Error] HTTP ${err.response.status}
        Endpoint: ${endpoint}
        Request body keys: ${Object.keys(payload).join(", ")}
        Merchant prefix: ${maskKey(merchantKey)}
        Response status: ${err.response.status}
        Response headers: ${JSON.stringify(err.response.headers)}
        Response body: ${JSON.stringify(err.response.data)}`);
    } else if (err.request) {
      console.error(`[OxaPay Error] No response received
        Endpoint: ${endpoint}
        Error: ${err.message}`);
    } else {
      console.error(`[OxaPay Error] Request setup failed: ${err.message}`);
    }

    throw err;
  }
};

/**
 * Queries OxaPay Merchant API to verify transaction status.
 * Endpoint: POST /merchants/inquiry
 */
export const verifyOxaPayTransaction = async (merchantKey: string, trackId: string) => {
  const payload: OxaPayInquiryPayload = {
    merchant: merchantKey,
    trackId
  };

  const endpoint = `${API_BASE}/merchants/inquiry`;

  console.log(`[OxaPay] Verifying transaction...
    Endpoint: ${endpoint}
    TrackId: ${trackId}
    Merchant: ${maskKey(merchantKey)}`);

  try {
    const response = await axios.post(endpoint, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000
    });

    console.log(`[OxaPay] Inquiry response status: ${response.status}
    Body: ${JSON.stringify(response.data)}`);

    return response.data;
  } catch (err: any) {
    if (err.response) {
      console.error(`[OxaPay Inquiry Error] HTTP ${err.response.status}
        Endpoint: ${endpoint}
        TrackId: ${trackId}
        Response status: ${err.response.status}
        Response body: ${JSON.stringify(err.response.data)}`);
    } else if (err.request) {
      console.error(`[OxaPay Inquiry Error] No response received
        Endpoint: ${endpoint}
        Error: ${err.message}`);
    } else {
      console.error(`[OxaPay Inquiry Error] Request setup failed: ${err.message}`);
    }

    throw err;
  }
};
