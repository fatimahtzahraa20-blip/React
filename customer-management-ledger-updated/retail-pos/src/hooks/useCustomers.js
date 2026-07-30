import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/services/customerService";

export default function useCustomers(search = "") {
  return useQuery({
    queryKey: ["customers", search],
    queryFn: () => getCustomers(search),
  });
}
