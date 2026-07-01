import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import DashboardCard from "../components/DashboardCard";
import DataTable, { Column } from "../components/DataTable";
import { Wallet, CreditCard, Receipt } from "lucide-react";

interface Invoice {
  id: string;
  orderId: string;
  amount: number;
  status: "Paid" | "Unpaid";
  createdAt: string;
}

export default function Billing() {
  const { authFetch } = useAuth();
  const [balance, setBalance] = useState("₹0.00");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      const res = await authFetch("/api/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePayInvoice = async (invoiceId: string) => {
    setPayingId(invoiceId);
    try {
      const res = await authFetch(`/api/invoices/${invoiceId}/pay`, {
        method: "POST"
      });
      if (res.ok) {
        fetchInvoices();
      }
    } catch (err) {
      console.error("Failed to pay invoice:", err);
    } finally {
      setPayingId(null);
    }
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
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          row.status === "Paid" 
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
            : "bg-red-500/10 text-red-400 border border-red-500/10"
        }`}>
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
      label: "Payment Action",
      render: (row) => (
        row.status === "Unpaid" ? (
          <button
            onClick={() => handlePayInvoice(row.id)}
            disabled={payingId === row.id}
            className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-white text-zinc-950 hover:bg-zinc-200 rounded transition-colors cursor-pointer"
          >
            {payingId === row.id ? "Paying..." : "Pay (Simulate)"}
          </button>
        ) : (
          <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">COMPLETED</span>
        )
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

          <DashboardCard title="Add Credit" subtitle="Payment gateway" className="border-zinc-800/60">
            <div className="flex gap-3 text-xs leading-normal bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-zinc-550">
              <CreditCard className="w-5 h-5 shrink-0 text-zinc-500" />
              <div className="space-y-1">
                <span className="font-bold text-zinc-450">Integrations Pending</span>
                <p className="text-[11px] leading-relaxed">Payment gateways (Stripe, PayPal) are temporarily offline for platform maintenance.</p>
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
    </div>
  );
}
