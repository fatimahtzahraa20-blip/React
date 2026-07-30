import { useQuery } from "@tanstack/react-query";
import { getLedger } from "@/services/ledgerService";

export default function useLedger(customerId) {
  return useQuery({
    queryKey: ["customer-ledger", customerId],
    queryFn: () => getLedger(customerId),
    enabled: Boolean(customerId),
  });
}
