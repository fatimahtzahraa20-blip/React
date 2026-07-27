import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteContactMessage,
  getContactMessages,
} from "../services/contact.service";

import type { Contact } from "../types/contact";

export default function useMessages() {
  const queryClient = useQueryClient();

  const messagesQuery = useQuery<Contact[], Error>({
    queryKey: ["messages"],
    queryFn: getContactMessages,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      deleteContactMessage(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages"],
      });
    },
  });

  return {
    messages: messagesQuery.data ?? [],

    loading: messagesQuery.isLoading,

    error: messagesQuery.error?.message ?? "",

    refetchMessages: messagesQuery.refetch,

    removeMessage:
      deleteMutation.mutateAsync,

    deletingMessage:
      deleteMutation.isPending,
  };
}