import { useMemo, useState } from "react";
import { Pencil, Power, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import { DataTable, Modal, PageHeader, SearchInput, StatsCard, StatusBadge } from "@/components/shared";
import DashboardLayout from "@/layouts/DashboardLayout";
import AccountSetupForms from "../components/AccountSetupForms";
import JournalForm from "../components/JournalForm";
import { useAccounts, useGeneralLedger, useSetAccountStatus, useUpdateAccount } from "../hooks/useAccounting";
import useAccountingStore from "../store/accountingStore";

const CREDIT_NORMAL = new Set(["liability", "equity", "revenue", "income", "accounts_payable", "payable"]);
const SYSTEM_CODES = new Set(["1000", "1010", "1100", "1200", "2000", "3000", "4000", "4100", "5000", "6000"]);
const ACCOUNT_TYPES = [
  ["all", "All types"],
  ["asset", "Assets"],
  ["cash", "Cash"],
  ["bank", "Bank"],
  ["inventory", "Inventory"],
  ["accounts_receivable", "Receivables"],
  ["liability", "Liabilities"],
  ["accounts_payable", "Payables"],
  ["equity", "Equity"],
  ["revenue", "Revenue"],
  ["expense", "Expenses"],
  ["cogs", "Cost of Goods Sold"],
];

const money = (value) => Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const typeLabel = (value) => String(value || "")
  .replaceAll("_", " ")
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function AccountsPage() {
  const tab = useAccountingStore((state) => state.tab);
  const search = useAccountingStore((state) => state.search);
  const setTab = useAccountingStore((state) => state.setTab);
  const setSearch = useAccountingStore((state) => state.setSearch);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [editing, setEditing] = useState(null);

  const { data: accounts = [], isLoading, isError: accountsError, error: accountsLoadError } = useAccounts();
  const { data: ledger = [], isLoading: ledgerLoading, isError: ledgerError, error: ledgerLoadError } = useGeneralLedger();

  const update = useUpdateAccount({
    onSuccess: () => {
      toast.success("Account updated");
      setEditing(null);
    },
    onError: (error) => toast.error(error.message),
  });
  const setStatus = useSetAccountStatus({
    onSuccess: () => toast.success("Account status updated"),
    onError: (error) => toast.error(error.message),
  });

  const balances = useMemo(() => accounts.map((account) => {
    const entries = ledger.filter((entry) => Number(entry.account_id) === Number(account.id));
    const debit = entries.reduce((sum, entry) => sum + Number(entry.debit || 0), 0);
    const credit = entries.reduce((sum, entry) => sum + Number(entry.credit || 0), 0);
    const creditNormal = CREDIT_NORMAL.has(String(account.account_type).toLowerCase());
    return {
      ...account,
      debit,
      credit,
      balance: creditNormal ? credit - debit : debit - credit,
      normal_side: creditNormal ? "Credit" : "Debit",
      is_system: SYSTEM_CODES.has(String(account.account_code)),
    };
  }), [accounts, ledger]);

  const filteredAccounts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return balances.filter((account) => {
      const matchesSearch = !keyword || [account.account_code, account.account_name, account.account_type]
        .some((value) => String(value || "").toLowerCase().includes(keyword));
      const matchesType = typeFilter === "all" || account.account_type === typeFilter;
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "active" ? account.status !== false : account.status === false);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [balances, search, typeFilter, statusFilter]);

  const filteredLedger = ledger.filter((entry) => !search || [
    entry.account?.account_name,
    entry.account?.account_code,
    entry.description,
    entry.reference_type,
  ].some((value) => String(value || "").toLowerCase().includes(search.toLowerCase())));

  const totalDebit = ledger.reduce((sum, entry) => sum + Number(entry.debit || 0), 0);
  const totalCredit = ledger.reduce((sum, entry) => sum + Number(entry.credit || 0), 0);
  const trialDifference = totalDebit - totalCredit;

  const ledgerColumns = [
    { key: "transaction_date", header: "Date" },
    { key: "account", header: "Account", render: (entry) => <div><p className="font-semibold">{entry.account?.account_name || "Account"}</p><p className="text-xs text-slate-500">{entry.account?.account_code}</p></div> },
    { key: "description", header: "Description" },
    { key: "reference_type", header: "Reference", render: (entry) => <span className="text-xs font-semibold uppercase">{entry.reference_type || "-"}</span> },
    { key: "debit", header: "Debit", render: (entry) => money(entry.debit) },
    { key: "credit", header: "Credit", render: (entry) => money(entry.credit) },
  ];

  const accountColumns = [
    { key: "account_code", header: "Code", render: (account) => <span className="font-mono font-semibold">{account.account_code || "-"}</span> },
    { key: "account_name", header: "Account", render: (account) => <div><p className="font-semibold">{account.account_name}</p>{account.is_system && <p className="mt-0.5 flex items-center gap-1 text-xs text-blue-600"><ShieldCheck className="size-3" /> System account</p>}</div> },
    { key: "account_type", header: "Type", render: (account) => typeLabel(account.account_type) },
    { key: "normal_side", header: "Normal side" },
    { key: "debit", header: "Debit", render: (account) => money(account.debit) },
    { key: "credit", header: "Credit", render: (account) => money(account.credit) },
    { key: "balance", header: "Balance", render: (account) => <span className={"font-bold " + (account.balance < 0 ? "text-red-600" : "")}>{money(account.balance)}</span> },
    { key: "status", header: "Status", render: (account) => <StatusBadge status={account.status !== false ? "success" : "inactive"} label={account.status !== false ? "Active" : "Inactive"} /> },
    { key: "actions", header: "Actions", render: (account) => <div className="flex gap-1">
      <button type="button" title="Edit account" onClick={() => setEditing({ ...account })} className="rounded-md border p-2 hover:bg-slate-50 dark:hover:bg-slate-800"><Pencil className="size-4" /></button>
      <button type="button" title={account.is_system ? "System accounts cannot be deactivated" : account.status !== false ? "Deactivate account" : "Activate account"} disabled={account.is_system} onClick={() => setStatus.mutate({ id: account.id, status: account.status === false })} className="rounded-md border p-2 text-amber-600 disabled:cursor-not-allowed disabled:opacity-35"><Power className="size-4" /></button>
    </div> },
  ];

  const bookTypes = tab === "cash" ? ["cash"] : tab === "bank" ? ["bank"] : null;
  const shownLedger = bookTypes
    ? filteredLedger.filter((entry) => bookTypes.includes(String(entry.account?.account_type).toLowerCase()))
    : filteredLedger;

  const tabs = [
    ["chart", "Chart of Accounts"],
    ["cash", "Cash Book"],
    ["bank", "Bank Book"],
    ["journal", "Journal Entry"],
    ["ledger", "General Ledger"],
    ["trial", "Trial Balance"],
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Accounts" description="Manage the retail chart of accounts, journals, books, balances, and financial controls." />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard title="Active Accounts" value={accounts.filter((account) => account.status !== false).length} />
          <StatsCard title="Total Debits" value={money(totalDebit)} tone="emerald" />
          <StatsCard title="Total Credits" value={money(totalCredit)} tone="amber" />
          <StatsCard title="Trial Difference" value={money(trialDifference)} tone={Math.abs(trialDifference) <= 0.005 ? "emerald" : "red"} />
        </div>

        <div className="flex flex-wrap gap-2 border-b pb-3">
          {tabs.map(([key, label]) => (
            <button key={key} type="button" onClick={() => setTab(key)} className={"rounded-md px-3 py-2 text-sm font-semibold transition " + (tab === key ? "bg-blue-600 text-white" : "border hover:border-blue-400")}>{label}</button>
          ))}
        </div>

        {(accountsError || ledgerError) && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20">
            {accountsLoadError?.message || ledgerLoadError?.message}
          </div>
        )}

        {tab === "chart" && <AccountSetupForms />}

        {tab === "journal" ? (
          <JournalForm />
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px]">
              <SearchInput value={search} onChange={setSearch} placeholder={tab === "chart" || tab === "trial" ? "Search code, account name, or type..." : "Search account, description, or reference..."} />
              {(tab === "chart" || tab === "trial") && (
                <>
                  <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900">
                    {ACCOUNT_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-md border bg-white px-3 text-sm dark:bg-slate-900">
                    <option value="active">Active accounts</option>
                    <option value="inactive">Inactive accounts</option>
                    <option value="all">All statuses</option>
                  </select>
                </>
              )}
            </div>

            {tab === "trial" && (
              <div className={"rounded-lg border p-4 text-sm font-semibold " + (Math.abs(trialDifference) <= 0.005 ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20" : "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/20")}>
                Trial balance {Math.abs(trialDifference) <= 0.005 ? "is balanced" : "is out of balance by " + money(Math.abs(trialDifference))}
              </div>
            )}

            <DataTable
              columns={tab === "chart" || tab === "trial" ? accountColumns : ledgerColumns}
              data={tab === "chart" || tab === "trial" ? filteredAccounts : shownLedger}
              isLoading={isLoading || ledgerLoading}
            />
          </>
        )}
      </div>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit Account" description="Changes affect future transactions; posted ledger entries remain unchanged.">
        {editing && (
          <form onSubmit={(event) => { event.preventDefault(); if (!editing.account_code?.trim() || !editing.account_name?.trim()) return toast.error("Account code and name are required"); update.mutate({ id: editing.id, values: editing }); }} className="space-y-4">
            <label className="block text-sm font-semibold">Account code<input value={editing.account_code || ""} disabled={editing.is_system} onChange={(event) => setEditing({ ...editing, account_code: event.target.value })} className="mt-1 h-10 w-full rounded-md border bg-transparent px-3 disabled:opacity-60" /></label>
            <label className="block text-sm font-semibold">Account name<input value={editing.account_name || ""} onChange={(event) => setEditing({ ...editing, account_name: event.target.value })} className="mt-1 h-10 w-full rounded-md border bg-transparent px-3" /></label>
            <label className="block text-sm font-semibold">Account type<select value={editing.account_type || "asset"} disabled={editing.is_system} onChange={(event) => setEditing({ ...editing, account_type: event.target.value })} className="mt-1 h-10 w-full rounded-md border bg-transparent px-3 disabled:opacity-60">{ACCOUNT_TYPES.filter(([value]) => value !== "all").map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={editing.status !== false} disabled={editing.is_system} onChange={(event) => setEditing({ ...editing, status: event.target.checked })} className="size-4" /> Active account</label>
            <button type="submit" disabled={update.isPending} className="h-10 w-full rounded-md bg-blue-600 font-semibold text-white disabled:opacity-50">{update.isPending ? "Saving..." : "Save Account"}</button>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
}
