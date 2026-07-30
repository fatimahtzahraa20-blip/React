import { useParams } from "react-router-dom";

import { LoadingSkeleton, PageHeader } from "@/components/shared";
import DashboardLayout from "@/layouts/DashboardLayout";
import CategoryForm from "../components/CategoryForm";
import { useCategory } from "../hooks/useCategories";

export default function EditCategory() {
  const { id } = useParams();
  const { data: category, isLoading } = useCategory(id);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader title="Edit Category" description="Update category details and availability." />
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {isLoading ? <LoadingSkeleton rows={4} /> : <CategoryForm category={category} />}
        </div>
      </div>
    </DashboardLayout>
  );
}
