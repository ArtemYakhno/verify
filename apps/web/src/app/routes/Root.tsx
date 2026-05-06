import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from '@/app/App';
import { RoutePath } from './configs/root.config';
import { NotFoundPage } from '@/features/not_found_page/NotFoundPage';
import { Gallery } from '@/features/gallery/Gallery';
import { SignInForm } from '@/features/auth/forms/SignInForm';
import { PrivacyPolicy } from '@/features/privacy_policy/PrivacyPolicy';
import { TermsConditions } from '@/features/terms_conditions/TermsConditions';
import { GuestRoute } from './GuestRoute';
import { Profile } from '@/features/profile/pages/Profile';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthLayout } from '../layouts/AuthLayout';
import { SignUpForm } from '@/features/auth/forms/SignUpForm';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { UserManagement } from '@/features/user-management/UserManagement';

export const Root = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={RoutePath.Default} element={<App />}>
          <Route path={RoutePath.Default} element={<Navigate to={RoutePath.Gallery} />} />
          <Route element={<DashboardLayout />}>
            <Route path={RoutePath.Gallery} element={<Gallery />} />
            <Route element={<ProtectedRoute />}>
              <Route path={RoutePath.Profile} element={<Profile />} />
              <Route path={RoutePath.UserManagement} element={<UserManagement />} />
            </Route>
          </Route>


          <Route element={<GuestRoute />}>
            <Route path={RoutePath.Auth} element={<AuthLayout />}>
              <Route index element={<Navigate to={RoutePath.SignIn} replace />} />
              <Route path={RoutePath.SignUp} element={<SignUpForm />} />
              <Route path={RoutePath.SignIn} element={<SignInForm />} />
            </Route>
          </Route>


          <Route path={RoutePath.PrivacyPolicy} element={<PrivacyPolicy />} />
          <Route path={RoutePath.TermsConditions} element={<TermsConditions />} />


          <Route path={RoutePath.NotFound} element={<NotFoundPage />} />
        </Route>
      </Routes>


    </BrowserRouter>
  );
};
