import axios from "axios";

const API_BASE = process.env.OXAPAY_API_URL || "https://api.oxapay.com";

function maskKey(key: string): string {
  if (key.length <= 8) return "***";
  return key.substring(0, 4) + "****" + key.substring(key.length - 4);
}

/**
 * Creates an OxaPay invoice via the V1 Payment API.
 * Endpoint: POST /v1/payment/invoice
 * Auth: merchant_api_key header
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
  const payload: Record<string, any> = {
    amount,
    currency,
    order_id: invoiceId,
    callback_url: callbackUrl,
    return_url: returnUrl,
    description: `CynexCloud Subscription Invoice ${invoiceId}`,
    lifetime: lifeTimeMinutes,
    fee_paid_by_payer: 0
  };

  if (email) {
    payload.email = email;
  }

  const endpoint = `${API_BASE}/v1/payment/invoice`;

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
      headers: {
        "Content-Type": "application/json",
        merchant_api_key: merchantKey
      },
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
 * Verifies an OxaPay transaction via the V1 Payment API.
 * Endpoint: GET /v1/payment/{track_id}
 * Auth: merchant_api_key header
 */
export const verifyOxaPayTransaction = async (merchantKey: string, trackId: string) => {
  const endpoint = `${API_BASE}/v1/payment/${trackId}`;

  console.log(`[OxaPay] Verifying transaction...
    Endpoint: ${endpoint}
    TrackId: ${trackId}
    Merchant: ${maskKey(merchantKey)}`);

  try {
    const response = await axios.get(endpoint, {
      headers: {
        "Content-Type": "application/json",
        merchant_api_key: merchantKey
      },
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
