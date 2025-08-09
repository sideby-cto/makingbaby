import { Route, Routes, useLocation } from "react-router-dom";
import {
  RootLayout,
  LandingPage,
  LoginPage,
  ExpiredSessionPage,
  GetStartedPage,
  UsersPage,
  TeamsPage,
  DataBankPage,
  CreateStoryPage,
} from "./pages";
import { DashboardPageRoutes } from "./pages/dashboard/DashboardPageRoutes";
import { usePageViewed } from "../utils/mixPanel/trackingHooks/usePageViewed";

export const AppRoutes = () => {
  const { pathname, search } = useLocation();
  const fullLocation = `${pathname}${search}`;

  usePageViewed({ location: fullLocation });

  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route path="/welcome" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/data-bank" element={<DataBankPage />} />
        <Route path="/expired-session" element={<ExpiredSessionPage />} />
        <Route path="/get-started" element={<GetStartedPage />} />
        <Route path="/create-story" element={<CreateStoryPage />} />
        <Route path="/dashboard/*" element={<DashboardPageRoutes />} />
      </Route>
    </Routes>
  );
};
