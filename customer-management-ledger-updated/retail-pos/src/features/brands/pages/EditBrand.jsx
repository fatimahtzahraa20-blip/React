import { useParams } from "react-router-dom";

import { LoadingSkeleton, PageHeader } from "@/components/shared";
import DashboardLayout from "@/layouts/DashboardLayout";
import BrandForm from "../components/BrandForm";
import { useBrand } from "../hooks/useBrands";

export default function EditBrand() {
  const { id } = useParams();
  const { data: brand, isLoading } = useBrand(id);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader title="Edit Brand" description="Update brand details and availability." />
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {isLoading ? <LoadingSkeleton rows={4} /> : <BrandForm brand={brand} />}
        </div>
      </div>
    </DashboardLayout>
  );
}
