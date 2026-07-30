import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import useDebounce from "@/hooks/useDebounce";
import {
  deleteSavedFilter,
  getSavedFilters,
  globalSearch,
  saveFilter,
} from "../services/searchService";

export function useGlobalSearch(filters) {
  const debouncedQuery = useDebounce(filters.query, 350);
  return useQuery({
    queryKey: ["global-search", { ...filters, query: debouncedQuery }],
    queryFn: () => globalSearch({ ...filters, query: debouncedQuery }),
    enabled: debouncedQuery.trim().length >= 2,
    placeholderData: (previous) => previous,
  });
}

export function useSavedFilters(module = "global-search") {
  return useQuery({
    queryKey: ["saved-filters", module],
    queryFn: () => getSavedFilters(module),
  });
}

export function useSaveFilter(options = {}) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: saveFilter,
    ...options,
    onSuccess: (...args) => {
      client.invalidateQueries({ queryKey: ["saved-filters"] });
      options.onSuccess?.(...args);
    },
  });
}

export function useDeleteSavedFilter(options = {}) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteSavedFilter,
    ...options,
    onSuccess: (...args) => {
      client.invalidateQueries({ queryKey: ["saved-filters"] });
      options.onSuccess?.(...args);
    },
  });
}
