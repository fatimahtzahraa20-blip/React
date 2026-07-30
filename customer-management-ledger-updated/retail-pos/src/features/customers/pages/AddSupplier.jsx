import DashboardLayout from "@/layouts/DashboardLayout";

import SupplierForm from "../components/SupplierForm";

export default function AddSupplier() {

  return (

    <DashboardLayout>

      <div className="space-y-6">

        <h1 className="text-3xl font-bold">

          Add Supplier

        </h1>

        <div className="rounded-xl border bg-white p-6">

          <SupplierForm />

        </div>

      </div>

    </DashboardLayout>

  );

}