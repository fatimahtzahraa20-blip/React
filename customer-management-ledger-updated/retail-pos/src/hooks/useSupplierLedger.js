import { useQuery } from "@tanstack/react-query";

import { getSupplierLedger } from "@/services/suplierLedgerService";

export default function useSupplierLedger(id) {

    return useQuery({

        queryKey: ["supplier-ledger", id],

        queryFn: () => getSupplierLedger(id),

        enabled: !!id,

    });

}
