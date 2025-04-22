
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";
import HomePage from "@/pages/HomePage";
import GalleryPage from "@/pages/GalleryPage";
import ArtworkDetails from "@/pages/ArtworkDetails";
import ExhibitionsPage from "@/pages/ExhibitionsPage";
import ExhibitionDetails from "@/pages/ExhibitionDetails";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import AdminArtworksPage from "@/pages/admin/ArtworksPage";
import AdminExhibitionsPage from "@/pages/admin/ExhibitionsPage";
import OrdersPage from "@/pages/admin/OrdersPage";
import OrderDetailsPage from "@/pages/admin/OrderDetailsPage";
import MessagesPage from "@/pages/admin/MessagesPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="gallery/:id" element={<ArtworkDetails />} />
            <Route path="exhibitions" element={<ExhibitionsPage />} />
            <Route path="exhibitions/:id" element={<ExhibitionDetails />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="artworks" element={<AdminArtworksPage />} />
            <Route path="exhibitions" element={<AdminExhibitionsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id/:type" element={<OrderDetailsPage />} />
            <Route path="messages" element={<MessagesPage />} />
          </Route>
          
          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
