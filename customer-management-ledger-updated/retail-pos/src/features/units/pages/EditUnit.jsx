import { useParams } from "react-router-dom";

import { LoadingSkeleton, PageHeader } from "@/components/shared";
import DashboardLayout from "@/layouts/DashboardLayout";
import UnitForm from "../components/UnitForm";
import { useUnit } from "../hooks/useUnits";

export default function EditUnit() {
  const { id } = useParams();
  const { data: unit, isLoading } = useUnit(id);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader title="Edit Unit" description="Update unit details and availability." />
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {isLoading ? <LoadingSkeleton rows={3} /> : <UnitForm unit={unit} />}
        </div>
      </div>
    </DashboardLayout>
  );
}
