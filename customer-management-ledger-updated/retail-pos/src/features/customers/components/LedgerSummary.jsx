import { ArrowDownCircle, ArrowUpCircle, Scale, WalletCards } from "lucide-react";
import { StatsCard } from "@/components/shared";
const money = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export default function LedgerSummary({ ledger = [], openingBalance = 0, currentBalance = 0 }) {
  const debit = ledger.reduce((sum, row) => sum + Number(row.debit || 0), 0);
  const credit = ledger.reduce((sum, row) => sum + Number(row.credit || 0), 0);
  const closing = ledger.length ? ledger.at(-1).balance : openingBalance;
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatsCard title="Period Opening" value={money(openingBalance)} icon={WalletCards} tone="violet" /><StatsCard title="Sales / Debit" value={money(debit)} icon={ArrowUpCircle} tone="red" /><StatsCard title="Payments / Credit" value={money(credit)} icon={ArrowDownCircle} tone="emerald" /><StatsCard title="Closing Balance" value={money(closing ?? currentBalance)} icon={Scale} tone={Number(closing) >= 0 ? "blue" : "amber"} /></div>;
}
