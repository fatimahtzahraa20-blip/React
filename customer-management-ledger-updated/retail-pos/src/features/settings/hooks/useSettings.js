import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SETTINGS_QUERY_KEY } from "../constants";
import {
  getSettings,
  updateSettings,
  uploadCompanyLogo,
} from "../services/settingsService";

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: getSettings,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSettings(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettings,
    ...options,
    onSuccess: (data, ...args) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, data);
      options.onSuccess?.(data, ...args);
    },
  });
}

export function useUploadCompanyLogo(options = {}) {
  return useMutation({
    mutationFn: uploadCompanyLogo,
    ...options,
  });
}
