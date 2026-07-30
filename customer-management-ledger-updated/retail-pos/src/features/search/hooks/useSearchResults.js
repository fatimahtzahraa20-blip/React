import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { globalSearch } from "../services/searchService";

export default function useSearchResults(filters) {
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(filters.query), 350);
    return () => window.clearTimeout(timer);
  }, [filters.query]);

  return useQuery({
    queryKey: ["global-search", { ...filters, query: debouncedQuery }],
    queryFn: () => globalSearch({ ...filters, query: debouncedQuery }),
    enabled: debouncedQuery.trim().length >= 2,
    placeholderData: (previous) => previous,
  });
}
