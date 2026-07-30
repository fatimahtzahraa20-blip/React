import { AlertTriangle, Boxes, CircleDollarSign, Receipt, ShoppingBag, TrendingUp, Users, Wallet } from "lucide-react";
import { StatsCard } from "@/components/shared";

export default function StatsGrid({ stats = {} }) {
  const currency = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const cards = [
    { title: "Today's Sales", value: currency(stats.todaySales), icon: CircleDollarSign, tone: "blue" },
    { title: "Today's Invoices", value: Number(stats.todayInvoices || 0).toLocaleString(), icon: Receipt, tone: "violet" },
    { title: "Monthly Revenue", value: currency(stats.monthlyRevenue), icon: TrendingUp, tone: "emerald" },
    { title: "Monthly Profit", value: currency(stats.monthlyProfit), icon: Wallet, tone: stats.monthlyProfit >= 0 ? "emerald" : "red" },
    { title: "Monthly Expenses", value: currency(stats.monthlyExpenses), icon: Wallet, tone: "red" },
    { title: "Monthly Purchases", value: currency(stats.monthlyPurchases), icon: ShoppingBag, tone: "violet" },
    { title: "Supplier Payable", value: currency(stats.purchaseOutstanding), icon: Receipt, tone: "amber" },
    { title: "Active Products", value: Number(stats.products || 0).toLocaleString(), icon: Boxes, tone: "violet" },
    { title: "Customers", value: Number(stats.customers || 0).toLocaleString(), icon: Users, tone: "blue" },
    { title: "Low Stock Alerts", value: Number(stats.lowStock || 0).toLocaleString(), icon: AlertTriangle, tone: "amber" },
  ];
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <StatsCard key={card.title} {...card} />)}</div>;
}
