import { useParams } from "react-router-dom";
import { LoadingSkeleton, PageHeader } from "@/components/shared";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProductForm from "../components/ProductForm";
import { useProduct } from "../hooks/useProducts";

export default function EditProduct() {
  const { id } = useParams();
  const { data, isLoading } = useProduct(id);
  return <DashboardLayout><div className="mx-auto max-w-5xl space-y-6"><PageHeader title="Edit Product" description="Update catalog, pricing, and availability." /><div className="rounded-xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">{isLoading ? <LoadingSkeleton /> : <ProductForm product={data} />}</div></div></DashboardLayout>;
}
