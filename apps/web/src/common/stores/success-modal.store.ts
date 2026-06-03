import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface SuccessModalData {
  title?: string;
  description?: string;
}

interface InitialState {
  isOpen: boolean;
  title: string;
  description: string;
}

interface ActionsState {
  open: (data?: SuccessModalData) => void;
  close: () => void;
}

type SuccessModalState = InitialState & ActionsState;

const initialState: InitialState = {
  isOpen: false,
  title: "",
  description: "",
};

const successModalStore: StateCreator<
  SuccessModalState,
  [["zustand/immer", never], ["zustand/devtools", never]]
> = (set) => ({
  ...initialState,

  open: (data) =>
    set((state) => {
      state.isOpen = true;

      state.title = data?.title || "Success";

      state.description =
        data?.description || "Your changes were successfully saved";
    }),

  close: () =>
    set((state) => {
      state.isOpen = false;
    }),
});

export const useSuccessModalStore = create<SuccessModalState>()(
  immer(
    devtools(successModalStore, {
      name: "SuccessModalStore",
    }),
  ),
);

export const useSuccessModalOpen = () => useSuccessModalStore((s) => s.isOpen);

export const useSuccessModalTitle = () => useSuccessModalStore((s) => s.title);

export const useSuccessModalDescription = () =>
  useSuccessModalStore((s) => s.description);

export const useCloseSuccessModal = () => useSuccessModalStore((s) => s.close);

export const openSuccessModal = (data?: SuccessModalData) =>
  useSuccessModalStore.getState().open(data);

export const closeSuccessModal = () => useSuccessModalStore.getState().close();
