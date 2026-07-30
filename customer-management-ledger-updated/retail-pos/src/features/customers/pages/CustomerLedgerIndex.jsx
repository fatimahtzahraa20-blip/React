import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Scale, Search, UserRoundCheck, WalletCards } from "lucide-react";

import { DataTable, EmptyState, ExportButton, PageHeader, PrintButton, StatsCard, StatusBadge } from "@/components/shared";
import useCustomers from "@/hooks/useCustomers";
import DashboardLayout from "@/layouts/DashboardLayout";
import exportToCsv from "@/utils/exportToCsv";
import printContent from "@/utils/printContent";
import ReceivePaymentDialog from "../components/ReceivePaymentDialog";

const money = (value) => "Rs " + Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function CustomerLedgerIndex() {
  const [search, setSearch] = useState("");
  const [balanceFilter, setBalanceFilter] = useState("outstanding");
  const { data: customers = [], isLoading, isError, error, refetch } = useCustomers();

  const rows = useMemo(() => customers.filter((customer) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch = !keyword || [
      customer.name,
      customer.customer_name,
      customer.phone,
      customer.customer_code,
    ].some((value) => String(value || "").toLowerCase().includes(keyword));
    const balance = Number(customer.current_balance || 0);
    const matchesBalance = balanceFilter === "all"
      || (balanceFilter === "outstanding" ? balance > 0 : balance <= 0);
    return matchesSearch && matchesBalance;
  }), [customers, search, balanceFilter]);

  const activeCustomers = customers.filter((customer) => customer.status !== false);
  const totalReceivable = activeCustomers.reduce(
    (sum, customer) => sum + Math.max(0, Number(customer.current_balance || 0)),
    0
  );
  const totalOpening = activeCustomers.reduce(
    (sum, customer) => sum + Number(customer.opening_balance || 0),
    0
  );
  const withBalance = activeCustomers.filter(
    (customer) => Number(customer.current_balance || 0) > 0
  ).length;

  const columns = [
    {
      key: "customer_code",
      header: "Code",
      render: (customer) => (
        <span className="font-mono font-medium text-slate-500">
          {customer.customer_code || "-"}
        </span>
      ),
    },
    {
      key: "name",
      header: "Customer",
      render: (customer) => (
        <div>
          <Link
            to={"/customers/" + customer.id + "/ledger"}
            className="font-semibold text-slate-900 hover:text-blue-600 dark:text-white"
          >
            {customer.name || customer.customer_name || "Customer"}
          </Link>
          <p className="mt-0.5 text-xs text-slate-400">
            {customer.phone || "No phone"}
          </p>
        </div>
      ),
    },
    {
      key: "opening_balance",
      header: "Opening",
      headerClassName: "px-4 py-3 text-right font-semibold",
      cellClassName: "px-4 py-3 text-right",
      render: (customer) => money(customer.opening_balance),
    },
    {
      key: "credit_limit",
      header: "Credit Limit",
      headerClassName: "px-4 py-3 text-right font-semibold",
      cellClassName: "px-4 py-3 text-right",
      render: (customer) => money(customer.credit_limit),
    },
    {
      key: "current_balance",
      header: "Receivable",
      headerClassName: "px-4 py-3 text-right font-semibold",
      cellClassName: "px-4 py-3 text-right",
      render: (customer) => (
        <span className={"font-bold " + (
          Number(customer.current_balance || 0) > 0
            ? "text-amber-600"
            : "text-emerald-600"
        )}>
          {money(customer.current_balance)}
        </span>
      ),
    },
    {
      key: "balance_status",
      header: "Account",
      render: (customer) => (
        <StatusBadge
          status={Number(customer.current_balance || 0) > 0 ? "warning" : "success"}
          label={Number(customer.current_balance || 0) > 0 ? "Receivable" : "Settled"}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "px-4 py-3 text-right font-semibold",
      cellClassName: "px-4 py-3",
      render: (customer) => (
        <div className="flex justify-end gap-2">
          <Link
            to={"/customers/" + customer.id + "/ledger"}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-semibold hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <BookOpen className="size-4" />
            Statement
          </Link>
          <ReceivePaymentDialog customer={customer} />
        </div>
      ),
    },
  ];

  const exportRows = () => exportToCsv({
    rows,
    fileName: "customer-receivables.csv",
    columns: [
      { label: "Code", value: "customer_code" },
      { label: "Customer", value: "name" },
      { label: "Phone", value: "phone" },
      { label: "Opening Balance", value: "opening_balance" },
      { label: "Credit Limit", value: "credit_limit" },
      { label: "Receivable", value: "current_balance" },
    ],
  });

  const printRows = () => printContent({
    title: "Customer Receivables Ledger",
    headers: ["Code", "Customer", "Phone", "Opening", "Credit Limit", "Receivable"],
    rows: rows.map((customer) => [
      customer.customer_code,
      customer.name || customer.customer_name,
      customer.phone,
      customer.opening_balance || 0,
      customer.credit_limit || 0,
      customer.current_balance || 0,
    ]),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Customer Ledger"
          description="Monitor accounts receivable, collect payments, and open complete customer statements."
          actions={(
            <>
              <ExportButton onExport={exportRows} disabled={!rows.length} label="Export Ledger" />
              <PrintButton onPrint={printRows} disabled={!rows.length} />
            </>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard title="Total Receivable" value={money(totalReceivable)} icon={WalletCards} tone="amber" />
          <StatsCard title="Customers with Balance" value={withBalance.toLocaleString()} icon={UserRoundCheck} tone="red" />
          <StatsCard title="Total Opening Balance" value={money(totalOpening)} icon={Scale} tone="violet" />
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer, code, or phone..."
              className="h-10 w-full rounded-md border border-slate-200 bg-transparent pl-10 pr-3 text-sm dark:border-slate-700"
            />
          </div>
          <div className="flex rounded-md bg-slate-100 p-1 dark:bg-slate-800">
            {[
              ["outstanding", "Outstanding"],
              ["settled", "Settled"],
              ["all", "All"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setBalanceFilter(value)}
                className={"rounded px-3 py-1.5 text-xs font-semibold transition " + (
                  balanceFilter === value
                    ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-300"
                    : "text-slate-500"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">Customer receivables could not be loaded</p>
            <p className="mt-1 text-sm">{error.message}</p>
            <button type="button" onClick={() => refetch()} className="mt-3 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white">Try again</button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            isLoading={isLoading}
            emptyState={<EmptyState title="No customer accounts found" description="Change the balance filter or post customer credit sales to view receivables." />}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
