import { useQuery } from "@tanstack/react-query";
import { getSuppliers } from "@/services/supplierService";

export default function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });
}
