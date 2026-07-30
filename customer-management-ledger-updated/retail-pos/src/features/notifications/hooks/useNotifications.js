import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotifications,
  getSystemLogs,
  markAllNotificationsRead,
  markNotificationRead,
  refreshSystemAlerts,
} from "../services/notificationService";

export const notificationKeys = {
  all: ["notifications"],
  logs: ["system-logs"],
};

export function useNotifications(options = {}) {
  return useQuery({
    queryKey: [...notificationKeys.all, options],
    queryFn: () => getNotifications(options),
    refetchInterval: 60_000,
  });
}

export function useSystemLogs(limit = 100) {
  return useQuery({
    queryKey: [...notificationKeys.logs, limit],
    queryFn: () => getSystemLogs({ limit }),
  });
}

export function useRefreshSystemAlerts(options = {}) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: refreshSystemAlerts,
    ...options,
    onSuccess: (...args) => {
      client.invalidateQueries({ queryKey: notificationKeys.all });
      options.onSuccess?.(...args);
    },
  });
}

export function useMarkNotificationRead(options = {}) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    ...options,
    onSuccess: (...args) => {
      client.invalidateQueries({ queryKey: notificationKeys.all });
      options.onSuccess?.(...args);
    },
  });
}

export function useMarkAllNotificationsRead(options = {}) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    ...options,
    onSuccess: (...args) => {
      client.invalidateQueries({ queryKey: notificationKeys.all });
      options.onSuccess?.(...args);
    },
  });
}
