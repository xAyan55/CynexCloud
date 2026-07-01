import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import DashboardCard from "../components/DashboardCard";
import DataTable, { Column } from "../components/DataTable";
import SkeletonLoader from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import { 
  History, 
  Search, 
  Filter, 
  ExternalLink, 
  Coins, 
  ArrowUpRight 
} from "lucide-react";

interface PaymentRecord {
  invoiceId: string;
  paymentId: string;
  paymentProvider: string;
  paymentAmount: number;
  paymentCurrency: string;
  paymentStatus: string;
  transactionHash?: string;
  paidAt?: string;
  createdAt: string;
}

export default function PaymentHistory() {
  const { authFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPaymentHistory = async () => {
    try {
      const res = await authFetch("/api/payments/history");
      if (res.ok) {
        const data = await res.json();
        setPayments(data.history || []);
      }
    } catch (err) {
      console.error("Failed to load payment history logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "paid" || s === "success") return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10";
    if (s === "confirming") return "bg-amber-500/10 text-amber-400 border border-amber-500/10";
    if (s === "unpaid" || s === "waiting" || s === "pending") return "bg-zinc-900 text-zinc-400 border border-zinc-800";
    return "bg-red-500/10 text-red-400 border border-red-500/10";
  };

  // Search & Filter processing
  const filteredRecords = payments.filter((rec) => {
    const matchesSearch = 
      rec.paymentId?.toLowerCase().includes(search.toLowerCase()) ||
      rec.invoiceId?.toLowerCase().includes(search.toLowerCase()) ||
      rec.transactionHash?.toLowerCase().includes(search.toLowerCase());

    const s = rec.paymentStatus?.toLowerCase() || "";
    const matchesFilter =
      statusFilter === "all" ||
      (statusFilter === "paid" && (s === "paid" || s === "success")) ||
      (statusFilter === "pending" && (s === "pending" || s === "waiting" || s === "waiting for payment" || s === "confirming")) ||
      (statusFilter === "failed" && (s === "failed" || s === "expired" || s === "cancelled"));

    return matchesSearch && matchesFilter;
  });

  const columns: Column<PaymentRecord>[] = [
    {
      key: "paymentId",
      label: "Transaction ID / Track ID",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-white font-mono text-[10px] select-all">{row.paymentId}</span>
          <span className="text-[9px] text-zinc-555 font-bold uppercase tracking-wider">Via {row.paymentProvider}</span>
        </div>
      )
    },
    {
      key: "invoiceId",
      label: "Invoice",
      render: (row) => <span className="font-mono text-zinc-400 text-[10px] select-all">{row.invoiceId}</span>
    },
    {
      key: "paymentAmount",
      label: "Amount Billed",
      render: (row) => <span className="font-mono text-white text-[11px]">₹{row.paymentAmount} INR</span>
    },
    {
      key: "paymentStatus",
      label: "Gateway Status",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(row.paymentStatus)}`}>
          {row.paymentStatus}
        </span>
      )
    },
    {
      key: "transactionHash",
      label: "Tx Hash",
      render: (row) => (
        row.transactionHash ? (
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono select-all">
            <span className="truncate max-w-[120px]">{row.transactionHash}</span>
            <ArrowUpRight className="w-3 h-3 text-emerald-500 shrink-0" />
          </div>
        ) : (
          <span className="text-zinc-650">—</span>
        )
      )
    },
    {
      key: "createdAt",
      label: "Transaction Date",
      render: (row) => (
        <span className="text-[10px] font-semibold text-zinc-500">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-6 select-none text-zinc-300 font-sans">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Payment Ledger</h2>
        <p className="text-xs text-zinc-500 font-medium font-sans">View automated cryptocurrency ledger details and blockchain transaction logs.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-950 border border-zinc-900 p-4 rounded-2xl print:hidden">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by Track ID, Invoice ID, or Hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 focus:ring-0 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-white placeholder-zinc-500 transition-colors"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-zinc-300 transition-colors"
          >
            <option value="all">All Transactions</option>
            <option value="paid">Paid & Success</option>
            <option value="pending">Pending & Waiting</option>
            <option value="failed">Failed / Cancelled</option>
          </select>
        </div>
      </div>

      {filteredRecords.length > 0 ? (
        <DashboardCard title="Cryptocurrency Transactions" subtitle="Detailed audit logs of cryptocurrency checkout actions">
          <div className="pt-2">
            <DataTable columns={columns} data={filteredRecords} pageSize={10} />
          </div>
        </DashboardCard>
      ) : (
        <EmptyState
          title="No transactions found"
          description="We couldn't find any cryptocurrency payment logs matching your query."
          icon={History}
        />
      )}
    </div>
  );
}
