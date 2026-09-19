import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserAudits from "./pages/UserAudits";
import AdminAudits from "./pages/AdminAudits";
import UserWaste from "./pages/UserWaste";
import AdminWaste from "./pages/AdminWaste";
import VerifyOTP from "./pages/VerifyOTP";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import "./styles/global.css";
import { ToastContainer } from "react-toastify";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ROLES } from "./utils/roles";

// Disaster pages
import UserDisasters from "./pages/UserDisasters";
import AdminDisasters from "./pages/AdminDisasters";

// Issue pages
import UserIssues from "./pages/UserIssues";
import CreateIssue from "./pages/CreateIssue";
import IssueDetails from "./pages/IssueDetails";
import AdminIssues from "./pages/AdminIssues";
import AdminScoring from "./pages/AdminScoring";
import CollectorDashboard from "./pages/CollectorDashboard";
import WasteCalendar from "./pages/WasteCalendar";
import Profile from "./pages/Profile";

import Marketplace from "./pages/Marketplace";
import ProductDetails from "./pages/ProductDetails";
import AdminMarketplace from "./pages/AdminMarketplace";
import UserMarketplace from "./pages/UserMarketplace";
import Chatbot from "./components/Chatbot";

import UserActions from "./pages/UserActions";
import AdminActions from "./pages/AdminActions";

// Articles pages
import UserArticles from "./pages/UserArticles";
import AdminArticles from "./pages/AdminArticles";
import ArticleDetails from "./pages/ArticleDetails";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="colored"
          />

          <div className="flex-grow pt-[88px]">
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/marketplace/:id" element={<ProductDetails />} />
                <Route path="/actions" element={<UserActions />} />
                <Route path="/articles" element={<UserArticles />} />
                <Route path="/articles/:id" element={<ArticleDetails />} />
              </Route>

              {/* User Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/audits" element={<UserAudits />} />
                  <Route path="/waste" element={<UserWaste />} />
                  <Route path="/disasters" element={<UserDisasters />} />

                  {/* Support Center routes */}
                  <Route path="/issues" element={<UserIssues />} />
                  <Route path="/calendar" element={<WasteCalendar />} />

                  {/* keep both so either link works */}
                  <Route path="/issues/new" element={<CreateIssue />} />
                  <Route path="/issues/create" element={<CreateIssue />} />

                  <Route path="/issues/:id" element={<IssueDetails />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/my-marketplace" element={<UserMarketplace />} />
                </Route>
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
                <Route element={<DashboardLayout isAdmin={true} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/audits" element={<AdminAudits />} />
                  <Route path="/admin/waste" element={<AdminWaste />} />
                  <Route path="/admin/disasters" element={<AdminDisasters />} />
                  <Route path="/admin/issues" element={<AdminIssues />} />
                  <Route path="/admin/scoring" element={<AdminScoring />} />
                  <Route path="/admin/actions" element={<AdminActions />} />
                  <Route path="/admin/articles" element={<AdminArticles />} />
                  <Route path="/admin/marketplace" element={<AdminMarketplace />} />
                </Route>
              </Route>

              {/* Collector Protected Routes */}
              <Route element={<ProtectedRoute roles={[ROLES.COLLECTOR]} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/collector/dashboard" element={<CollectorDashboard />} />
                  <Route path="/waste" element={<CollectorDashboard />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Route>
            </Routes>
          </div>

          <Chatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;