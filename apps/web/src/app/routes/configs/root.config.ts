export const RouteSegment = {
  auth: "auth",
  signUp: "sign-up",
  signIn: "sign-in",
  privacyPolicy: "privacy-policy",
  termsConditions: "terms-conditions",
  galleries: "galleries",
  search: "search",
  create: "create",
  id: ":id",
  edit: "edit",
  upload: "upload",
  profile: "profile",
  userManagement: "user-management",
  notFound: "/404",
} as const;

export const RoutePath = {
  Default: "/",
  Auth: `/${RouteSegment.auth}`,
  SignUp: `/${RouteSegment.auth}/${RouteSegment.signUp}`,
  SignIn: `/${RouteSegment.auth}/${RouteSegment.signIn}`,
  PrivacyPolicy: `/${RouteSegment.privacyPolicy}`,
  TermsConditions: `/${RouteSegment.termsConditions}`,
  Galleries: `/${RouteSegment.galleries}`,
  GalleriesSearch: `/${RouteSegment.galleries}/${RouteSegment.search}`,
  GalleryCreate: `/${RouteSegment.galleries}/${RouteSegment.create}`,
  GalleryDetail: `/${RouteSegment.galleries}/${RouteSegment.id}`,
  GalleryEdit: `/${RouteSegment.galleries}/${RouteSegment.id}/${RouteSegment.edit}`,
  GalleryUpload: `/${RouteSegment.galleries}/${RouteSegment.id}/${RouteSegment.edit}/${RouteSegment.upload}`,
  Profile: `/${RouteSegment.profile}`,
  UserManagement: `/${RouteSegment.userManagement}`,
  NotFoundPage: `/${RouteSegment.notFound}`,
  NotFound: "*",
} as const;

export type RoutePath = (typeof RoutePath)[keyof typeof RoutePath];

export const buildPath = {
  galleryDetail: (id: number) => `/${RouteSegment.galleries}/${id}`,
  galleryEdit: (id: number) =>
    `/${RouteSegment.galleries}/${id}/${RouteSegment.edit}`,
  galleryUpload: (id: number) =>
    `/${RouteSegment.galleries}/${id}/${RouteSegment.edit}/${RouteSegment.upload}`,
};
