
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect } from "react";

// Pages
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/AdminLogin";
import ArtworksPage from "./pages/ArtworksPage";
import ExhibitionsPage from "./pages/ExhibitionsPage";
import ArtworkDetail from "./pages/ArtworkDetail";
import ExhibitionDetail from "./pages/ExhibitionDetail";
import ArtworkCheckout from "./pages/ArtworkCheckout";
import ExhibitionCheckout from "./pages/ExhibitionCheckout";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import AdminMessages from "./pages/AdminMessages";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => {
  // Set document title
  useEffect(() => {
    document.title = "The Art Gallery of Nairobi - Kenyan Art Gallery & Exhibitions";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/artworks" element={<ArtworksPage />} />
                  <Route path="/artworks/:id" element={<ArtworkDetail />} />
                  <Route path="/exhibitions" element={<ExhibitionsPage />} />
                  <Route path="/exhibitions/:id" element={<ExhibitionDetail />} />
                  <Route path="/checkout/artwork/:id" element={<ArtworkCheckout />} />
                  <Route path="/checkout/exhibition/:id" element={<ExhibitionCheckout />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/messages" element={<AdminMessages />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
