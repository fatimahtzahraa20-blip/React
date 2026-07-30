import { PageHeader } from "@/components/shared";
import DashboardLayout from "@/layouts/DashboardLayout";
import CategoryForm from "../components/CategoryForm";

export default function AddCategory() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader title="Add Category" description="Create a category for organizing products." />
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CategoryForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
