import { PageHeader } from "@/components/shared";
import DashboardLayout from "@/layouts/DashboardLayout";
import BrandForm from "../components/BrandForm";

export default function AddBrand() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader title="Add Brand" description="Create a product brand or manufacturer." />
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <BrandForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
