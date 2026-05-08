import { useAuthStore } from "@/common/stores/auth.store";
import { queryClient } from "@/common/queries/queryClient";

export const globalLogout = () => {
  useAuthStore.getState().logout();
  queryClient.clear();
};