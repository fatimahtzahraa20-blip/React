import { PageHeader } from "@/components/shared";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProductForm from "../components/ProductForm";

export default function AddProduct() {
  return <DashboardLayout><div className="mx-auto max-w-5xl space-y-6"><PageHeader title="Add Product" description="Create a product with pricing, identifiers, and opening stock." /><div className="rounded-xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><ProductForm /></div></div></DashboardLayout>;
}
