import { supabase } from "@/lib/supabase";

function dateKey(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export async function getDashboardAnalytics() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const chartStart = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10);

  const [
    invoicesResult,
    itemsResult,
    expensesResult,
    stockResult,
    customersResult,
    suppliersResult,
    productsResult,
    purchasesResult,
    ledgerResult,
  ] = await Promise.all([
    supabase.from("invoices").select("*").gte("invoice_date", chartStart).order("invoice_date", { ascending: false }),
    supabase.from("invoice_items").select("product_id,quantity,total,product:products(id,product_name)"),
    supabase.from("expenses").select("amount,expense_date,status").gte("expense_date", chartStart),
    supabase.from("stock").select("quantity,product:products(id,product_name,minimum_stock),warehouse:warehouses(name)"),
    supabase.from("customers").select("*"),
    supabase.from("suppliers").select("*"),
    supabase.from("products").select("id", { count: "exact" }).eq("status", true),
    supabase.from("purchases").select("*").gte("purchase_date", chartStart).order("purchase_date", { ascending: false }),
    supabase.from("ledger_entries").select("debit,credit,transaction_date,account:accounts(account_type)").gte("transaction_date", monthStart),
  ]);

  const customerById = new Map((customersResult.data || []).map((customer) => [
    String(customer.id),
    { ...customer, name: customer.name || customer.full_name || customer.customer_name || customer.phone || "Customer" },
  ]));
  const invoices = (invoicesResult.data || [])
    .filter((invoice) => invoice.status !== "cancelled")
    .map((invoice) => ({
      ...invoice,
      customer: invoice.customer_id ? customerById.get(String(invoice.customer_id)) || null : null,
    }));
  const expenses = (expensesResult.data || []).filter((expense) => expense.status === "posted");
  const supplierById = new Map((suppliersResult.data || []).map((supplier) => [
    String(supplier.id),
    { ...supplier, name: supplier.name || supplier.supplier_name || supplier.phone || "Supplier" },
  ]));
  const purchases = (purchasesResult.data || [])
    .filter((purchase) => purchase.status !== "cancelled")
    .map((purchase) => ({
      ...purchase,
      supplier: supplierById.get(String(purchase.supplier_id)) || null,
    }));
  const monthlyPurchases = purchases.filter((purchase) => dateKey(purchase.purchase_date) >= monthStart);
  const todayInvoices = invoices.filter((invoice) => dateKey(invoice.invoice_date) === today);
  const monthlyInvoices = invoices.filter((invoice) => dateKey(invoice.invoice_date) >= monthStart);
  const monthlyRevenue = monthlyInvoices.reduce((sum, invoice) => sum + Number(invoice.grand_total || 0), 0);
  const monthlyExpenses = expenses.filter((expense) => dateKey(expense.expense_date) >= monthStart).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const cogs = (ledgerResult.data || []).filter((entry) => ["cogs", "cost_of_goods_sold"].includes(String(entry.account?.account_type).toLowerCase())).reduce((sum, entry) => sum + Number(entry.debit || 0) - Number(entry.credit || 0), 0);

  const monthMap = new Map();
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    monthMap.set(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`, {
      month: date.toLocaleString(undefined, { month: "short" }),
      sales: 0,
      expenses: 0,
    });
  }
  invoices.forEach((invoice) => {
    const key = dateKey(invoice.invoice_date).slice(0, 7);
    if (monthMap.has(key)) monthMap.get(key).sales += Number(invoice.grand_total || 0);
  });
  expenses.forEach((expense) => {
    const key = dateKey(expense.expense_date).slice(0, 7);
    if (monthMap.has(key)) monthMap.get(key).expenses += Number(expense.amount || 0);
  });

  const productSales = new Map();
  (itemsResult.data || []).forEach((item) => {
    const current = productSales.get(item.product_id) || { name: item.product?.product_name || "Product", quantity: 0, revenue: 0 };
    current.quantity += Number(item.quantity || 0);
    current.revenue += Number(item.total || 0);
    productSales.set(item.product_id, current);
  });
  const supplierTotals = new Map();
  purchases.forEach((purchase) => {
    if (!purchase.supplier_id) return;
    const current = supplierTotals.get(purchase.supplier_id) || { name: purchase.supplier?.name || "Supplier", total: 0 };
    current.total += Number(purchase.grand_total || 0);
    supplierTotals.set(purchase.supplier_id, current);
  });
  const customerTotals = new Map();
  invoices.forEach((invoice) => {
    if (!invoice.customer?.id) return;
    const current = customerTotals.get(invoice.customer.id) || { name: invoice.customer.name, total: 0 };
    current.total += Number(invoice.grand_total || 0);
    customerTotals.set(invoice.customer.id, current);
  });

  return {
    stats: {
      todaySales: todayInvoices.reduce((sum, invoice) => sum + Number(invoice.grand_total || 0), 0),
      todayInvoices: todayInvoices.length,
      monthlyRevenue,
      monthlyProfit: monthlyRevenue - cogs - monthlyExpenses,
      monthlyExpenses,
      monthlyPurchases: monthlyPurchases.reduce((sum, purchase) => sum + Number(purchase.grand_total || 0), 0),
      purchaseOutstanding: purchases.reduce((sum, purchase) => sum + Number(purchase.due_amount || 0), 0),
      purchaseInvoices: purchases.length,
      products: productsResult.count || productsResult.data?.length || 0,
      customers: customersResult.data?.length || 0,
      lowStock: (stockResult.data || []).filter((row) => Number(row.quantity) <= Number(row.product?.minimum_stock || 0)).length,
    },
    chart: [...monthMap.values()],
    bestSelling: [...productSales.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    topCustomers: [...customerTotals.values()].sort((a, b) => b.total - a.total).slice(0, 5),
    topSuppliers: [...supplierTotals.values()].sort((a, b) => b.total - a.total).slice(0, 5),
    lowStock: (stockResult.data || []).filter((row) => Number(row.quantity) <= Number(row.product?.minimum_stock || 0)).slice(0, 8),
    recentInvoices: invoices.slice(0, 8),
    recentPurchases: purchases.slice(0, 8),
  };
}


