import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  addVideo,
  deleteVideo,
  getVideos,
  updateVideo,
} from "../services/video.service";

import type {
  CreateVideoInput,
  UpdateVideoInput,
  Video,
} from "../types/video";

export default function useVideos() {
  const queryClient = useQueryClient();

  const videosQuery = useQuery<Video[], Error>({
    queryKey: ["videos"],
    queryFn: getVideos,
  });

  const createMutation = useMutation({
    mutationFn: (video: CreateVideoInput) =>
      addVideo(video),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["videos"],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      video,
    }: {
      id: string;
      video: UpdateVideoInput;
    }) => updateVideo(id, video),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["videos"],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      deleteVideo(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["videos"],
      });
    },
  });

  return {
    videos: videosQuery.data ?? [],
    loading: videosQuery.isLoading,
    error: videosQuery.error?.message ?? "",

    refetchVideos: videosQuery.refetch,

    createVideo: createMutation.mutateAsync,
    creatingVideo: createMutation.isPending,

    editVideo: updateMutation.mutateAsync,
    updatingVideo: updateMutation.isPending,

    removeVideo: deleteMutation.mutateAsync,
    deletingVideo: deleteMutation.isPending,
  };
}