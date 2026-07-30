import { supabase } from "@/lib/supabase";

const between = (query, column, from, to) => query.gte(column, from).lte(column, `${to}T23:59:59`);
const partyName = (party, fallback) => party?.name || party?.full_name || party?.customer_name || party?.supplier_name || party?.phone || fallback;

async function attachParties(rows, type) {
  const idKey = `${type}_id`;
  const table = type === "customer" ? "customers" : "suppliers";
  const ids = [...new Set(rows.map((row) => row[idKey]).filter(Boolean))];
  if (!ids.length) return rows;
  const { data, error } = await supabase.from(table).select("*").in("id", ids);
  if (error) throw error;
  const map = new Map((data || []).map((party) => [String(party.id), partyName(party, type === "customer" ? "Customer" : "Supplier")]));
  return rows.map((row) => ({ ...row, party_name: map.get(String(row[idKey])) || (type === "customer" ? "Walking Customer" : "Supplier") }));
}

export async function getReportData({ type, from, to }) {
  const configs = {
    sales: ["invoices", "invoice_date"], purchases: ["purchases", "purchase_date"],
    expenses: ["expenses", "expense_date"], incomes: ["incomes", "income_date"],
    payments: ["payments", "payment_date"], customers: ["customers", "created_at"],
    suppliers: ["suppliers", "created_at"], products: ["products", "created_at"], stock: ["stock", "updated_at"],
  };
  const config = configs[type];
  if (!config) return [];
  const [table, dateColumn] = config;
  const { data, error } = await between(supabase.from(table).select("*"), dateColumn, from, to);
  if (error) {
    const paymentsMissing = type === "payments" && (["PGRST205", "42P01"].includes(error.code) || error.message?.includes("public.payments"));
    if (paymentsMissing) return [];
    throw error;
  }
  let rows = data || [];

  if (type === "sales") rows = await attachParties(rows, "customer");
  if (type === "purchases") rows = await attachParties(rows, "supplier");
  if (type === "payments") {
    const customers = await attachParties(rows.filter((row) => row.party_type === "customer"), "customer");
    const suppliers = await attachParties(rows.filter((row) => row.party_type === "supplier"), "supplier");
    rows = [...customers, ...suppliers].sort((a, b) => String(b.payment_date).localeCompare(String(a.payment_date)));
  }
  if (type === "customers" || type === "suppliers") rows = rows.map((row) => ({ ...row, party_name: partyName(row, type === "customers" ? "Customer" : "Supplier") }));

  if (["expenses", "incomes", "products", "stock"].includes(type)) {
    const relationConfig = {
      expenses: ["expense_categories", "category_id", "category_name"],
      incomes: ["income_categories", "category_id", "category_name"],
      products: ["categories", "category_id", "category_name"],
      stock: ["products", "product_id", "product_name"],
    }[type];
    const [relationTable, relationKey, labelKey] = relationConfig;
    const ids = [...new Set(rows.map((row) => row[relationKey]).filter(Boolean))];
    if (ids.length) {
      const { data: related, error: relationError } = await supabase.from(relationTable).select("*").in("id", ids);
      if (relationError) throw relationError;
      const map = new Map((related || []).map((item) => [String(item.id), item.name || item.product_name || "-"]));
      rows = rows.map((row) => ({ ...row, [labelKey]: map.get(String(row[relationKey])) || "-" }));
    }
  }
  if (type === "stock") {
    const ids = [...new Set(rows.map((row) => row.warehouse_id).filter(Boolean))];
    if (ids.length) {
      const { data: warehouses, error: warehouseError } = await supabase.from("warehouses").select("*").in("id", ids);
      if (warehouseError) throw warehouseError;
      const map = new Map((warehouses || []).map((item) => [String(item.id), item.name || item.code || "Warehouse"]));
      rows = rows.map((row) => ({ ...row, warehouse_name: map.get(String(row.warehouse_id)) || "-" }));
    }
  }
  return rows;
}

export async function getFinancialReport({ from, to }) {
  const [{ data: sales, error: salesError }, { data: expenses, error: expenseError }, { data: purchases, error: purchaseError }] = await Promise.all([
    between(supabase.from("invoices").select("grand_total,tax,status,invoice_date"), "invoice_date", from, to),
    between(supabase.from("expenses").select("amount,status,expense_date"), "expense_date", from, to),
    between(supabase.from("purchases").select("grand_total,tax,purchase_date"), "purchase_date", from, to),
  ]);
  if (salesError || expenseError || purchaseError) throw salesError || expenseError || purchaseError;
  const revenue = (sales || []).filter((row) => row.status !== "cancelled").reduce((sum, row) => sum + Number(row.grand_total || 0), 0);
  const expenseTotal = (expenses || []).filter((row) => row.status === "posted").reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const purchaseTotal = (purchases || []).filter((row) => row.status !== "cancelled").reduce((sum, row) => sum + Number(row.grand_total || 0), 0);
  return { revenue, expenses: expenseTotal, purchases: purchaseTotal, profit: revenue - purchaseTotal - expenseTotal };
}