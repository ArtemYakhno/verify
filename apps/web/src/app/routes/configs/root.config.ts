export const RoutePath = {
  Default: "/",
  Auth: "/auth",
  SignUp: "/auth/sign-up",
  SignIn: "/auth/sign-in",
  PrivacyPolicy: "/privacy-policy",
  TermsConditions: "/terms-conditions",
  Gallery: "/gallery",
  GallerySearch: "/gallery/search",
  Profile: "/profile",
  UserManagement: "/user-management",
  NotFound: "*",
} as const;

export type RoutePath = (typeof RoutePath)[keyof typeof RoutePath];
