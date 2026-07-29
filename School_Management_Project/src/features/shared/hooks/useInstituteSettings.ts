import { useQuery } from "@tanstack/react-query";
import { getInstituteSettings } from "../api/instituteSettings.api";

export function useInstituteSettings() {
  const query = useQuery({
    queryKey: ["institute-settings"],
    queryFn: getInstituteSettings,
    staleTime: 5 * 60 * 1000,
  });
  return {
    name: query.data?.institute_name?.trim() || "School",
    logoUrl: query.data?.logo_url ?? null,
    isLoading: query.isLoading,
  };
}
