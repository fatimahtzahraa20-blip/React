import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createUnit,
  deactivateUnit,
  getUnitById,
  getUnits,
  updateUnit,
} from "../services/unitService";

export const unitKeys = {
  all: ["units"],
  detail: (id) => ["units", id],
};

export function useUnits() {
  return useQuery({
    queryKey: unitKeys.all,
    queryFn: getUnits,
  });
}

export function useUnit(id) {
  return useQuery({
    queryKey: unitKeys.detail(id),
    queryFn: () => getUnitById(id),
    enabled: Boolean(id),
  });
}

export function useCreateUnit(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUnit,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: unitKeys.all });
      options.onSuccess?.(...args);
    },
  });
}

export function useUpdateUnit(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }) => updateUnit(id, values),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: unitKeys.all });
      options.onSuccess?.(...args);
    },
  });
}

export function useDeactivateUnit(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateUnit,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: unitKeys.all });
      options.onSuccess?.(...args);
    },
  });
}
