export type SearchParams = {
  [key: string]: string | string[] | null | undefined;
};

export function getSearchWith(
  currentParams: URLSearchParams,
  paramsToUpdate: SearchParams,
): string {
  const newParams = new URLSearchParams(currentParams.toString());

  Object.entries(paramsToUpdate).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (value === null) {
      newParams.delete(key);
    } else if (Array.isArray(value)) {
      newParams.delete(key);

      value.forEach((part) => {
        newParams.append(key, part);
      });
    } else {
      newParams.set(key, value);
    }
  });

  return newParams.toString();
}

export const normalizeParam = <T>(value: T | undefined, defaultValue?: T) => {
  if (value === undefined) return undefined;
  if (value === defaultValue) return null;
  if (value === null) return null;
  if (typeof value === "string" && !value.trim()) return null;
  return String(value);
};

export const removeEmptyParams = <T extends Record<string, unknown>>(
  params: T,
) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string" && !value.trim()) return false;
      return true;
    }),
  );
};

export const searchParamsToObject = (searchParams: URLSearchParams) => {
  return Object.fromEntries(searchParams.entries());
};
