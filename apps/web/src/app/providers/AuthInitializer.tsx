import { useQueryClient } from "@tanstack/react-query";
import { setAccessToken, setInitialized } from "../../common/stores/auth.store";
import { useEffect, type ReactNode } from "react";
import { authService } from "../../common/api/services/auth.service";
import { profileKeys } from "../../features/profile/queries/profile.keys";
import { profileService } from "../../common/api/services/profile.service";
import { globalLogout } from "@/common/utils/globalLogout";


export function AuthInitializer({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const initialize = async () => {
      try {
        const { accessToken } = await authService.refresh();
        setAccessToken(accessToken);

        await queryClient.fetchQuery({
          queryKey: profileKeys.me(),
          queryFn: profileService.getProfile,
        });
      } catch {
        globalLogout();
      } finally {
        setInitialized();
      }
    };

    initialize();
  }, [queryClient]);

  return <>{children}</>;
}