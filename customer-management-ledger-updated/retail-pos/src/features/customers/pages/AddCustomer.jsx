import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/shared";
import CustomerForm from "../components/CustomerForm";

export default function AddCustomer() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link to="/customers" className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
            <ArrowLeft className="size-4" /> Back to customers
          </Link>
          <PageHeader title="Add Customer" description="Create a new customer profile and opening balance." />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CustomerForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
