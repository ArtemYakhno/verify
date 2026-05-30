import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "@/app/App";
import { RoutePath, RouteSegment } from "./configs/root.config";
import { NotFoundPage } from "@/features/not_found_page/NotFoundPage";
import { SignInForm } from "@/features/auth/forms/SignInForm";
import { SignUpForm } from "@/features/auth/forms/SignUpForm";
import { PrivacyPolicy } from "@/features/privacy_policy/PrivacyPolicy";
import { TermsConditions } from "@/features/terms_conditions/TermsConditions";
import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ScrollToTop } from "../ScrollToTop";
import { Profile } from "@/features/profile/pages/Profile";
import { UserManagement } from "@/features/user-management/UserManagement";
import { GalleryLayout } from "@/features/galleries/layouts/GalleryLayout";
import { Galleries } from "@/features/galleries/pages/Galleries";
import { GalleryDetail } from "@/features/galleries/pages/GalleryDetail";
import { GalleryOwnerGuard } from "../../common/guards/GalleryOwnerGuard";
import { GalleryCreateForm } from "@/features/galleries/forms/GalleryCreateForm";
import { GalleryEditForm } from "@/features/galleries/forms/GalleryEditForm";
import { GalleryUploadForm } from "@/features/galleries/forms/GalleryUploadForm";
import { InvalidIdGuard } from "../../common/guards/InvalidIdGuard";

export const Root = () => (
  <BrowserRouter>
    <ScrollToTop />
    <Routes>
      <Route path={RoutePath.Default} element={<App />}>
        <Route index element={<Navigate to={RoutePath.Galleries} replace />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path={RouteSegment.galleries} element={<GalleryLayout />}>
              <Route index element={<Galleries />} />
              <Route path={RouteSegment.create} element={<GalleryCreateForm />} />
              <Route element={<InvalidIdGuard />}>
                <Route path={RouteSegment.id} element={<GalleryDetail />} />
                <Route element={<GalleryOwnerGuard />}>
                  <Route path={`${RouteSegment.id}/${RouteSegment.edit}`}>
                    <Route index element={<GalleryEditForm />} />
                    <Route path={RouteSegment.upload} element={<GalleryUploadForm />} />
                  </Route>
                </Route>
              </Route>


            </Route>

            <Route path={RouteSegment.profile} element={<Profile />} />
            <Route path={RouteSegment.userManagement} element={<UserManagement />} />
          </Route>
        </Route>

        <Route element={<GuestRoute />}>
          <Route path={RouteSegment.auth} element={<AuthLayout />}>
            <Route index element={<Navigate to={RoutePath.SignIn} replace />} />
            <Route path={RouteSegment.signUp} element={<SignUpForm />} />
            <Route path={RouteSegment.signIn} element={<SignInForm />} />
          </Route>
        </Route>

        <Route path={RouteSegment.privacyPolicy} element={<PrivacyPolicy />} />
        <Route path={RouteSegment.termsConditions} element={<TermsConditions />} />


        <Route path={RouteSegment.notFound} element={<NotFoundPage />} />
        <Route path={RoutePath.NotFound} element={<Navigate to={RoutePath.NotFoundPage} replace />} />
      </Route>
    </Routes>
  </BrowserRouter >
);