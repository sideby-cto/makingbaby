import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Faqs from "./pages/Faqs";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Availability from "./pages/Availability";
import Community from "./pages/Community";
import Matches from "./pages/Matches";
import MatchDetail from "./pages/MatchDetail";
import Toolbox from "./pages/Toolbox";
import Sponsorship from "./pages/Sponsorship";
import Crew from "./pages/Crew";
import Settings from "./pages/Settings";
import YourData from "./pages/YourData";
import ValuesPage from "./pages/ValuesPage";
import SignupSuccess from "./pages/SignupSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminUserJourneys from "./pages/AdminUserJourneys";
import AdminMatchmaker from "./pages/AdminMatchmaker";
import AdminSponsorship from "./pages/AdminSponsorship";
import AdminSponsorshipRequests from "./pages/AdminSponsorshipRequests";
import AdminSessions from "./pages/AdminSessions";
import EmailManagementPage from "./pages/EmailManagementPage";
import NotificationManagementPage from "./pages/NotificationManagementPage";
import CoreFlowMonitoring from "./pages/CoreFlowMonitoring";
import ChaosTestingPage from "./pages/ChaosTestingPage";
import AdminBadgeOptInsPage from "./pages/AdminBadgeOptInsPage";
import CrewsAdminPage from "./components/admin/crews/CrewsAdminPage";
import CrewCodePage from "./pages/CrewCodePage";
import AdminExperiments from "./pages/AdminExperiments";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import { ToolboxProvider } from "./contexts/ToolboxContext";

export const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ToolboxProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/faqs" element={<Faqs />} />
        <Route path="/sponsor-teacher" element={<Navigate to="/sponsorship" replace />} />
        <Route path="/signup-success" element={<SignupSuccess />} />
        <Route path="/values" element={<ValuesPage />} />

        
        {/* Protected member routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/availability" 
          element={
            <ProtectedRoute>
              <Availability />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/community" 
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/matches" 
          element={
            <ProtectedRoute>
              <Matches />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/matches/:matchId" 
          element={
            <ProtectedRoute>
              <MatchDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/toolbox" 
          element={
            <ProtectedRoute>
              <Toolbox />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sponsorship" 
          element={
            <ProtectedRoute>
              <Sponsorship />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/crew" 
          element={
            <ProtectedRoute>
              <Crew />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/crew-code" 
          element={<CrewCodePage />}
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/your-data" 
          element={
            <ProtectedRoute>
              <YourData />
            </ProtectedRoute>
          } 
        />

        {/* Admin routes - require admin privileges */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminRequired={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute adminRequired={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute adminRequired={true}>
              <AdminUsers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/user-journeys" 
          element={
            <ProtectedRoute adminRequired={true}>
              <AdminUserJourneys />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/matchmaker" 
          element={
            <ProtectedRoute adminRequired={true}>
              <AdminMatchmaker />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/sponsorship" 
          element={
            <ProtectedRoute adminRequired={true}>
              <AdminSponsorship />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/sponsorship-requests" 
          element={
            <ProtectedRoute adminRequired={true}>
              <AdminSponsorshipRequests />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/badge-opt-ins" 
          element={
            <ProtectedRoute adminRequired={true}>
              <AdminBadgeOptInsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/crews" 
          element={
            <ProtectedRoute adminRequired={true}>
              <CrewsAdminPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/email-management" 
          element={
            <ProtectedRoute adminRequired={true}>
              <EmailManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/notifications" 
          element={
            <ProtectedRoute adminRequired={true}>
              <NotificationManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/core-flow" 
          element={
            <ProtectedRoute adminRequired={true}>
              <CoreFlowMonitoring />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/sessions" 
          element={
            <ProtectedRoute adminRequired={true}>
              <AdminSessions />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/chaos-testing" 
          element={
            <ProtectedRoute adminRequired={true}>
              <ChaosTestingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/experiments" 
          element={
            <ProtectedRoute adminRequired={true}>
              <AdminExperiments />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ToolboxProvider>
  );
};
