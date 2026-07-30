import { PageHeader } from "@/components/shared";
import DashboardLayout from "@/layouts/DashboardLayout";
import UnitForm from "../components/UnitForm";

export default function AddUnit() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader title="Add Unit" description="Create an inventory measurement unit." />
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <UnitForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
