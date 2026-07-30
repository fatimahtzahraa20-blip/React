import { useQuery } from "@tanstack/react-query";

import { getSupplierById } from "@/services/supplierService";

export default function useSupplier(id) {
  return useQuery({
    queryKey: ["supplier", id],
    queryFn: () => getSupplierById(id),
    enabled: Boolean(id),
  });
}
