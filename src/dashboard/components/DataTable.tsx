import React, { useState, useMemo } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Skeleton } from "./SkeletonLoader";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  loading?: boolean;
  pageSize?: number;
}

export default function DataTable<T extends Record<string, any>>({ 
  columns, 
  data, 
  searchPlaceholder = "Search list...", 
  searchKey,
  loading = false,
  pageSize = 8
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Filter query logic
  const filteredData = useMemo(() => {
    if (!query || !searchKey) return data;
    return data.filter(row => {
      const val = row[searchKey as string];
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(query.toLowerCase());
    });
  }, [data, query, searchKey]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === undefined || bVal === undefined) return 0;
      
      const comp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDirection === "asc" ? comp : -comp;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  return (
    <div className="space-y-5 select-none">
      {searchKey && (
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-0 transition-colors"
          />
        </div>
      )}

      <div className="w-full overflow-x-auto border border-zinc-800 bg-zinc-900/40 rounded-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-widest text-[10px] font-semibold">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`py-4 px-5 font-semibold ${
                    col.sortable ? "cursor-pointer select-none hover:text-white transition-colors" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key as string)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable && <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, rIdx) => (
                <tr key={rIdx} className="border-b border-zinc-800/40 last:border-0">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="py-4 px-5">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-zinc-800/40 last:border-0 hover:bg-white/[0.02] transition-colors">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="py-4 px-5 text-zinc-300 font-medium">
                      {col.render ? col.render(row) : row[col.key as string]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-zinc-500 font-medium">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center text-sm text-zinc-500 font-medium pt-1">
          <span>
            Showing Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
