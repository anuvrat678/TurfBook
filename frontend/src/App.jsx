
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import ListGround from './pages/admin/ListGround'; // Fixed casing
import GroundBooking from './pages/GroundBooking';
import Receipt from './pages/Receipt';
import GroundsPage from './pages/GroundsPage';
import AdminGrounds from './pages/admin/ViewGrounds';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import EditGround from './pages/admin/EditGround';
import Bookinglist from './pages/admin/BookingList';
import AnalyticsDashboard from './pages/admin/Analytics';
import VerifyEmail from './pages/user/VerifyEmail';
import ResendVerification from './pages/user/ResendVerificationEmail';
import ForgotPassword from './pages/user/ForgotPassword';
import ResetPassword from './pages/user/ResetPassword';

// PrivateRoute component to protect routes
const PrivateRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/receipt" element={<Receipt />} />
      <Route path="/grounds/:id" element={<GroundBooking />} />
      <Route path="/grounds" element={<GroundsPage />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/privacypolicy" element={<PrivacyPolicy />} />
      <Route path="/admin/grounds/edit/:id" element={<EditGround />} />
      <Route path="/admin/bookings" element={<Bookinglist />} />
      <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/resend-verification" element={<ResendVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin Routes */}
      <Route
        path="/admin/listground"
        element={
          <PrivateRoute allowedRole="admin">
            <ListGround />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute allowedRole="admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* User Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRole="user">
            <UserDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/grounds"
        element={
          <PrivateRoute allowedRole="admin">
            <AdminGrounds />
          </PrivateRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;