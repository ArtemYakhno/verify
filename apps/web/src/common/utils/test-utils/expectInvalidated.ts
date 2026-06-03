import { waitFor } from "@testing-library/react";

type AnyReadonlyArray = readonly unknown[];

export  async function expectInvalidated(
  invalidateSpy: ReturnType<typeof vi.spyOn>,
  ...keys: AnyReadonlyArray[]
) {
  await waitFor(() => {
    for (const key of keys) {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: key });
    }
  });
}