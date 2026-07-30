import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { getCustomerById } from "@/services/customerService";
import exportToCsv from "@/utils/exportToCsv";
import printContent from "@/utils/printContent";
import useLedger from "@/hooks/useLedger";
import LedgerHeader from "../components/LedgerHeader";
import LedgerFilters from "../components/LedgerFilters";
import LedgerSummary from "../components/LedgerSummary";
import LedgerTable from "../components/LedgerTable";

const EMPTY_FILTERS = { from: "", to: "", type: "" };

export default function CustomerLedger() {
  const { id } = useParams();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [mode, setMode] = useState("detailed");
  const customerQuery = useQuery({ queryKey: ["customer", id], queryFn: () => getCustomerById(id), enabled: Boolean(id) });
  const ledgerQuery = useLedger(id);
  const customer = customerQuery.data;
  const rawLedger = ledgerQuery.data || [];

  const completeLedger = useMemo(() => {
    let running = Number(customer?.opening_balance || 0);
    return rawLedger.map((row) => {
      running += Number(row.debit || 0) - Number(row.credit || 0);
      return { ...row, balance: running };
    });
  }, [rawLedger, customer?.opening_balance]);

  const filteredLedger = useMemo(() => completeLedger.filter((row) => {
    if (filters.from && row.transaction_date < filters.from) return false;
    if (filters.to && row.transaction_date > filters.to) return false;
    if (filters.type === "debit" && !Number(row.debit)) return false;
    if (filters.type === "credit" && !Number(row.credit)) return false;
    return true;
  }), [completeLedger, filters]);

  const periodOpening = useMemo(() => {
    if (!filters.from) return Number(customer?.opening_balance || 0);
    const previous = completeLedger.filter((row) => row.transaction_date < filters.from).at(-1);
    return previous ? previous.balance : Number(customer?.opening_balance || 0);
  }, [completeLedger, customer?.opening_balance, filters.from]);

  const isLoading = customerQuery.isLoading || ledgerQuery.isLoading;
  const error = customerQuery.error || ledgerQuery.error;
  const handleExport = () => exportToCsv({ rows: filteredLedger, fileName: `${customer?.customer_code || "customer"}-ledger.csv`, columns: [
    { label: "Date", value: "transaction_date" }, { label: "Type", value: "reference_type" }, { label: "Reference", value: "reference_no" }, { label: "Description", value: "description" }, { label: "Debit", value: (row) => row.debit || 0 }, { label: "Credit", value: (row) => row.credit || 0 }, { label: "Balance", value: (row) => row.balance || 0 },
  ] });
  const handlePrint = () => printContent({ title: `${customer?.name || "Customer"} - Ledger Statement`, headers: ["Date", "Type", "Reference", "Description", "Debit", "Credit", "Balance"], rows: filteredLedger.map((row) => [row.transaction_date, row.reference_type, row.reference_no, row.description, row.debit || 0, row.credit || 0, row.balance]) });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <LedgerHeader customer={customer} onExport={handleExport} onPrint={handlePrint} disabled={isLoading || !filteredLedger.length} />
        {error ? <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"><AlertCircle className="mt-0.5 size-5 shrink-0" /><div><p className="font-semibold">Customer statement could not be loaded</p><p className="mt-1 text-sm">{error.message}</p><button type="button" onClick={() => { customerQuery.refetch(); ledgerQuery.refetch(); }} className="mt-3 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white">Try again</button></div></div> : null}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><LedgerFilters filters={filters} onChange={setFilters} onReset={() => setFilters(EMPTY_FILTERS)} /><div className="flex w-fit shrink-0 items-center rounded-md border border-slate-200 bg-white p-1 text-sm dark:border-slate-800 dark:bg-slate-900">{[["detailed", "Detailed"], ["compact", "Compact"]].map(([value, label]) => <button key={value} type="button" onClick={() => setMode(value)} className={`rounded px-3 py-1.5 font-semibold transition ${mode === value ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>{label}</button>)}</div></div>
        <LedgerSummary ledger={filteredLedger} openingBalance={periodOpening} currentBalance={customer?.current_balance} />
        <LedgerTable ledger={filteredLedger} loading={isLoading} mode={mode} />
      </div>
    </DashboardLayout>
  );
}
