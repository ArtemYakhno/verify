import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ComponentType, ReactNode } from "react";

type Wrapper = ComponentType<{ children: ReactNode }>;

interface WrapperWithClient {
  queryClient: QueryClient;
  wrapper: Wrapper;
}

export function createWrapper(options: { exposeClient: true }): WrapperWithClient;
export function createWrapper(options?: { exposeClient?: false }): Wrapper;
export function createWrapper(options?: { exposeClient?: boolean }): Wrapper | WrapperWithClient {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper: Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  if (options?.exposeClient) {
    return { queryClient, wrapper };
  }

  return wrapper;
}