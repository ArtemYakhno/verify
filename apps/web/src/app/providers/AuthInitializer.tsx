import { useQueryClient } from "@tanstack/react-query";
import { setAccessToken, setInitialized } from "../../common/stores/auth.store";
import { useEffect, type ReactNode } from "react";
import { authService } from "../../common/api/services/auth.service";
import { profileKeys } from "../../features/profile/queries/profile.keys";
import { profileService } from "../../common/api/services/profile.service";
import { useLogout } from "@/features/auth/queries/auth.mutations";


export function AuthInitializer({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { mutate: logout } = useLogout()

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
        logout();
      } finally {
        setInitialized();
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}