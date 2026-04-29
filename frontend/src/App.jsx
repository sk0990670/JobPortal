import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Analytics } from '@vercel/analytics/react';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const OAuthCallback  = lazy(() => import('./pages/OAuthCallback'));
const OTPVerifyPage  = lazy(() => import('./pages/OTPVerifyPage'));
const JobListingPage = lazy(() => import('./pages/JobListingPage'));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));
const InternshipPage = lazy(() => import('./pages/InternshipPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const PostJobPage = lazy(() => import('./pages/PostJobPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MyApplications = lazy(() => import('./pages/MyApplications'));
const SavedJobs = lazy(() => import('./pages/SavedJobs'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminJobs      = lazy(() => import('./pages/admin/AdminJobs'));
const AdminResources = lazy(() => import('./pages/admin/AdminResources'));
const EditJobPage    = lazy(() => import('./pages/admin/EditJobPage'));

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <>
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Auth routes (no layout) */}
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/signup"         element={<SignUpPage />} />
        <Route path="/verify-otp"     element={<OTPVerifyPage />} />
        <Route path="/auth/callback"  element={<OAuthCallback />} />

        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/jobs" element={<JobListingPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/internships" element={<InternshipPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/post-job" element={<PostJobPage />} />
        </Route>

        {/* Protected dashboard routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applications" element={<MyApplications />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings"    element={<SettingsPage />} />
            <Route path="/resources"   element={<ResourcesPage />} />
            {/* ── Admin routes ── */}
            <Route path="/admin/dashboard"  element={<AdminDashboard />} />
            <Route path="/admin/jobs"       element={<AdminJobs />} />
            <Route path="/admin/resources"      element={<AdminResources />} />
            <Route path="/admin/jobs/:id/edit"  element={<EditJobPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    <Analytics />
  </>
);

export default App;
