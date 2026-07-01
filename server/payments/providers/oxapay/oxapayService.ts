import axios from "axios";

export interface OxaPayRequestPayload {
  merchant: string;
  amount: number;
  currency: string;
  orderId: string;
  callbackUrl: string;
  returnUrl: string;
  description?: string;
}

export interface OxaPayInquiryPayload {
  merchant: string;
  trackId: string;
}

const API_URL = process.env.OXAPAY_API_URL || "https://api.oxapay.com";

/**
 * Calls OxaPay Merchants Request API to generate a crypto checkout URL
 */
export const createOxaPayInvoice = async (
  merchantKey: string,
  invoiceId: string,
  amount: number,
  currency: string,
  callbackUrl: string,
  returnUrl: string
) => {
  const payload: OxaPayRequestPayload = {
    merchant: merchantKey,
    amount,
    currency,
    orderId: invoiceId,
    callbackUrl,
    returnUrl,
    description: `CynexCloud Subscription Invoice ${invoiceId}`
  };

  const response = await axios.post(`${API_URL}/api/v2/merchants/request`, payload, {
    headers: { "Content-Type": "application/json" }
  });

  return response.data;
};

/**
 * Queries OxaPay Merchants Inquiry API to verify transaction status directly from source
 */
export const verifyOxaPayTransaction = async (merchantKey: string, trackId: string) => {
  const payload: OxaPayInquiryPayload = {
    merchant: merchantKey,
    trackId
  };

  const response = await axios.post(`${API_URL}/api/v2/merchants/inquiry`, payload, {
    headers: { "Content-Type": "application/json" }
  });

  return response.data;
};
