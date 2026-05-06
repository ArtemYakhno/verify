export const profileKeys = {
  default: ["profile"] as const,
  me: () => [...profileKeys.default, "me"] as const,
};