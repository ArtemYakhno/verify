import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface InitialState {
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

interface ActionsState {
  setAccessToken: (token: string) => void;
  setInitialized: () => void;
  logout: () => void;
}

type AuthState = InitialState & ActionsState;

const initialState: InitialState = {
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authStore: StateCreator<
  AuthState,
  [["zustand/immer", never], ["zustand/devtools", never]]
> = (set) => ({
  ...initialState,

  setAccessToken: (token) =>
    set((state) => {
      state.accessToken = token;
      state.isAuthenticated = true;
    }),

  setInitialized: () =>
    set((state) => {
      state.isInitialized = true;
    }),

  logout: () =>
    set((state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
    }),
});

export const useAuthStore = create<AuthState>()(
  immer(devtools(authStore, { name: "AuthStore" })),
);

export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useIsInitialized = () => useAuthStore((s) => s.isInitialized);

export const setAccessToken = (token: string) =>
  useAuthStore.getState().setAccessToken(token);
export const setInitialized = () => useAuthStore.getState().setInitialized();
export const logout = () => useAuthStore.getState().logout();

export const getAuthState = () => useAuthStore.getState();
