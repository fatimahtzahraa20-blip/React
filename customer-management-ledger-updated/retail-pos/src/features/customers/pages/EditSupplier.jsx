import { useParams } from "react-router-dom";

import DashboardLayout from "@/layouts/DashboardLayout";

import SupplierForm from "../components/SupplierForm";

import useSupplier from "@/hooks/useSupplier";

export default function EditSupplier() {

    const { id } = useParams();

    const {

        data,

        isLoading,

    } = useSupplier(id);

    return (

        <DashboardLayout>

            <div className="space-y-6">

                <h1 className="text-3xl font-bold">

                    Edit Supplier

                </h1>

                {isLoading ? (

                    <div className="rounded-xl border bg-white p-8">

                        Loading...

                    </div>

                ) : (

                    <div className="rounded-xl border bg-white p-6">

                        <SupplierForm

                            supplierId={id}

                            defaultValues={data}

                        />

                    </div>

                )}

            </div>

        </DashboardLayout>

    );

}
