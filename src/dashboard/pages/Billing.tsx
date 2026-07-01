import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import DashboardCard from "../components/DashboardCard";
import DataTable, { Column } from "../components/DataTable";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  CreditCard, 
  Receipt, 
  Copy, 
  Download, 
  ExternalLink, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Coins 
} from "lucide-react";

interface Invoice {
  id: string;
  orderId: string;
  amount: number;
  status: string; // Paid, Unpaid, Cancelled
  createdAt: string;
  
  // OxaPay properties
  paymentProvider?: string;
  paymentId?: string;
  paymentCurrency?: string;
  paymentAmount?: number;
  paymentStatus?: string;
  transactionHash?: string;
  paidAt?: string;
  expiresAt?: string;
  callbackVerified?: number;
}

export default function Billing() {
  const { authFetch } = useAuth();
  const [balance, setBalance] = useState("₹0.00");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Modal & Polling details
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInvoices = async () => {
    try {
      const res = await authFetch("/api/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
        
        // If an invoice is currently selected, refresh its local state too
        if (selectedInvoice) {
          const fresh = (data.invoices || []).find((i: Invoice) => i.id === selectedInvoice.id);
          if (fresh) {
            setSelectedInvoice(fresh);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    return () => {
      stopPolling();
    };
  }, []);

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setPollingStatus(null);
  };

  const startPolling = (invoiceId: string) => {
    stopPolling();
    setPollingStatus("Waiting for payment...");
    
    // Poll every 10 seconds
    const interval = setInterval(async () => {
      try {
        const res = await authFetch(`/api/payments/${invoiceId}/status`);
        if (res.ok) {
          const statusData = await res.json();
          const currentStatus = statusData.paymentStatus || statusData.status;

          setPollingStatus(`Gateway status: ${currentStatus}`);

          if (
            statusData.status === "Paid" || 
            currentStatus === "Paid" || 
            currentStatus === "Success"
          ) {
            stopPolling();
            fetchInvoices();
            setPollingStatus("Payment confirmed! Service provisioned.");
          } else if (
            currentStatus === "Expired" || 
            currentStatus === "Failed" || 
            currentStatus === "Cancelled"
          ) {
            stopPolling();
            fetchInvoices();
            setPollingStatus("Payment transaction expired or failed.");
          }
        }
      } catch (err) {
        console.error("Status polling failed:", err);
      }
    }, 10000);

    pollingIntervalRef.current = interval;
  };

  const handleCreatePayment = async (invoiceId: string) => {
    setLoadingPayment(true);
    try {
      const res = await authFetch("/api/payments/oxapay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId })
      });
      if (res.ok) {
        const data = await res.json();
        // Redirect client to OxaPay Checkout portal
        if (data.payUrl) {
          window.open(data.payUrl, "_blank");
          startPolling(invoiceId);
          fetchInvoices();
        }
      }
    } catch (err) {
      console.error("Failed to create OxaPay invoice link:", err);
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleManualRefresh = async (invoiceId: string) => {
    setPollingStatus("Checking status...");
    try {
      const res = await authFetch(`/api/payments/${invoiceId}/status`);
      if (res.ok) {
        const statusData = await res.json();
        const currentStatus = statusData.paymentStatus || statusData.status;
        setPollingStatus(`Status: ${currentStatus}`);
        fetchInvoices();
        
        if (statusData.status === "Paid" || currentStatus === "Paid" || currentStatus === "Success") {
          stopPolling();
        }
      }
    } catch (err) {
      console.error("Status inquiry check failed:", err);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    alert("Invoice ID copied to clipboard.");
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "paid" || s === "success") return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10";
    if (s === "confirming") return "bg-amber-500/10 text-amber-400 border border-amber-500/10";
    if (s === "unpaid" || s === "waiting" || s === "waiting for payment") return "bg-zinc-900 text-zinc-400 border border-zinc-800";
    return "bg-red-500/10 text-red-400 border border-red-500/10";
  };

  const columns: Column<Invoice>[] = [
    {
      key: "id",
      label: "Invoice ID",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Receipt className="w-4 h-4 text-zinc-500" />
          <span className="font-bold text-white select-all font-mono text-[10px]">{row.id}</span>
        </div>
      )
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => <span className="font-mono text-white text-[11px]">₹{row.amount}</span>
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(row.status)}`}>
          {row.status}
        </span>
      )
    },
    {
      key: "createdAt",
      label: "Billing Date",
      render: (row) => <span className="text-[10px] font-semibold text-zinc-500">{new Date(row.createdAt).toLocaleDateString()}</span>
    },
    {
      key: "actions",
      label: "Action",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedInvoice(row);
            if (row.status === "Unpaid" && row.paymentId) {
              startPolling(row.id);
            }
          }}
          className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-white text-zinc-950 hover:bg-zinc-200 rounded transition-colors cursor-pointer"
        >
          View Details
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Billing & Invoices</h2>
        <p className="text-xs text-zinc-500 font-medium">Review your account statements, credit balance, and transaction history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Balance Card */}
        <div className="space-y-6">
          <DashboardCard title="Account Credit" subtitle="Available balance">
            <div className="flex items-center gap-4 py-3 select-none">
              <div className="p-3 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-555 uppercase tracking-widest block leading-none mb-1">Total credit</span>
                <span className="text-2xl font-bold text-white leading-none tracking-tight">{balance}</span>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Payment Method" subtitle="Supported gateways">
            <div className="flex gap-3 text-xs leading-normal bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-zinc-550">
              <Coins className="w-5 h-5 shrink-0 text-white" />
              <div className="space-y-1">
                <span className="font-bold text-white">OxaPay Crypto integration</span>
                <p className="text-[11px] leading-relaxed">Secure cryptocurrency billing is active. Instantly clear invoices with Bitcoin, USDT, or Litecoin.</p>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Right Side: Invoices list */}
        <div className="lg:col-span-2">
          <DashboardCard title="Billing History" subtitle="Invoices billed to your profile">
            <div className="pt-2">
              <DataTable columns={columns} data={invoices} pageSize={5} />
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Invoice Details Dialog Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-8 max-w-lg w-full relative my-8 print:border-none print:bg-white print:text-black">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-zinc-850 pb-4 mb-6 print:hidden">
              <div>
                <h3 className="text-sm font-black uppercase text-white tracking-tight">Invoice Details</h3>
                <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Transaction hash and billing ledger</p>
              </div>
              <button 
                onClick={() => {
                  stopPolling();
                  setSelectedInvoice(null);
                }} 
                className="text-zinc-500 hover:text-white font-bold text-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Header */}
            <div className="hidden print:block text-center mb-8">
              <h2 className="text-2xl font-bold uppercase">CynexCloud Billing Ledger</h2>
              <p className="text-xs text-zinc-500">Official hosting service transaction statement</p>
            </div>

            {/* Invoice Meta Attributes */}
            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block">Invoice ID</span>
                  <span className="font-mono text-white font-bold print:text-black flex items-center gap-1">
                    {selectedInvoice.id}
                    <button 
                      onClick={() => handleCopyId(selectedInvoice.id)}
                      className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors print:hidden cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-555 uppercase tracking-widest block">Billing Status</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block">Billed Amount</span>
                  <span className="font-semibold text-white print:text-black block text-sm">₹{selectedInvoice.amount} INR</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block">Payment Method</span>
                  <span className="font-semibold text-zinc-300 print:text-black block uppercase tracking-wider text-[10px]">
                    {selectedInvoice.paymentProvider || "OxaPay Crypto"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block">Created Date</span>
                  <span className="font-semibold text-white print:text-black block">
                    {new Date(selectedInvoice.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block">Expires Date</span>
                  <span className="font-semibold text-white print:text-black block">
                    {selectedInvoice.expiresAt ? new Date(selectedInvoice.expiresAt).toLocaleString() : "N/A"}
                  </span>
                </div>
              </div>

              {selectedInvoice.transactionHash && (
                <div className="space-y-1 border-t border-zinc-900 pt-3">
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block">Blockchain Tx Hash</span>
                  <span className="font-mono text-emerald-400 select-all break-all block text-[10px] font-bold">
                    {selectedInvoice.transactionHash}
                  </span>
                </div>
              )}

              {selectedInvoice.paidAt && (
                <div className="space-y-1 border-t border-zinc-900 pt-3">
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block">Paid Timestamp</span>
                  <span className="font-semibold text-white print:text-black block">
                    {new Date(selectedInvoice.paidAt).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Status Polling Live Alert */}
              {pollingStatus && (
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-[10px] font-semibold text-zinc-400 flex items-center justify-between gap-3 animate-pulse print:hidden">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                    <span>{pollingStatus}</span>
                  </div>
                  <button 
                    onClick={() => handleManualRefresh(selectedInvoice.id)}
                    className="text-[9px] uppercase tracking-wider text-white hover:underline cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>
              )}

              {/* Action Buttons Panel */}
              <div className="flex gap-3 border-t border-zinc-900 pt-5 mt-6 print:hidden">
                <Button 
                  onClick={handlePrintInvoice}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-bold py-2.5 px-4 h-auto text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print Ledger</span>
                </Button>

                {selectedInvoice.status === "Unpaid" && (
                  <Button
                    onClick={() => handleCreatePayment(selectedInvoice.id)}
                    disabled={loadingPayment}
                    className="flex-1 bg-white text-zinc-950 hover:bg-zinc-200 font-black py-2.5 px-6 h-auto text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>{loadingPayment ? "Generating..." : "Pay with Crypto"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
