import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import { LoadingSkeleton, PageHeader } from "@/components/shared";
import { getCustomerById } from "@/services/customerService";
import CustomerForm from "../components/CustomerForm";

export default function EditCustomer() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link to="/customers" className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
            <ArrowLeft className="size-4" /> Back to customers
          </Link>
          <PageHeader title="Edit Customer" description={data?.name ? `Update ${data.name}'s profile and account settings.` : "Update the customer's profile and account settings."} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {isLoading ? <LoadingSkeleton rows={5} /> : <CustomerForm defaultValues={data} customerId={id} />}
        </div>
      </div>
    </DashboardLayout>
  );
}
