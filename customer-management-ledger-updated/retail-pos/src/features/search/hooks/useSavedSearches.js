import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteSavedFilter,
  getSavedFilters,
  saveFilter,
} from "../services/searchService";

export function useSavedSearches(module = "global-search") {
  return useQuery({
    queryKey: ["saved-filters", module],
    queryFn: () => getSavedFilters(module),
  });
}

export function useSaveSearch(options = {}) {
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

export function useDeleteSavedSearch(options = {}) {
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
