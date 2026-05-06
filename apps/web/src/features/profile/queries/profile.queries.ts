import { useQuery } from "@tanstack/react-query";
import { profileKeys } from "./profile.keys";
import { useIsAuthenticated } from "@/common/stores/auth.store";
import { profileService } from "@/common/api/services/profile.service";

export const useGetMe = () => {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: profileService.getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
