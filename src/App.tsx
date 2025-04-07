import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ArtworksPage from './pages/ArtworksPage';
import ArtworkDetail from './pages/ArtworkDetail';
import ExhibitionsPage from './pages/ExhibitionsPage'; 
import ExhibitionDetail from './pages/ExhibitionDetail';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import AdminMessages from './pages/AdminMessages';
import AdminTickets from './pages/AdminTickets';
import AdminArtworks from './pages/AdminArtworks';
import AdminExhibitions from './pages/AdminExhibitions';
import AdminOrders from './pages/AdminOrders';
import NotFound from './pages/NotFound';
import ArtworkCheckout from './pages/ArtworkCheckout';
import ExhibitionCheckout from './pages/ExhibitionCheckout';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import ChatBot from './components/ChatBot';
import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        {/* Public routes with full layout */}
        <Route path="/" element={
          <>
            <Navbar />
            <main className="flex-grow">
              <Home />
            </main>
            <Footer />
          </>
        } />

        {/* Admin routes with custom layout */}
        <Route path="/admin" element={<AdminLayout><Admin /></AdminLayout>} />
        <Route path="/admin/messages" element={<AdminLayout><AdminMessages /></AdminLayout>} />
        <Route path="/admin/tickets" element={<AdminLayout><AdminTickets /></AdminLayout>} />
        <Route path="/admin/artworks" element={<AdminLayout><AdminArtworks /></AdminLayout>} />
        <Route path="/admin/exhibitions" element={<AdminLayout><AdminExhibitions /></AdminLayout>} />
        <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Other public routes with full layout */}
        <Route path="/" element={
          <>
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/artworks" element={<ArtworksPage />} />
                <Route path="/artworks/:id" element={<ArtworkDetail />} />
                <Route path="/artwork-checkout/:id" element={<ArtworkCheckout />} />
                <Route path="/exhibitions" element={<ExhibitionsPage />} />
                <Route path="/exhibitions/:id" element={<ExhibitionDetail />} />
                <Route path="/exhibition-checkout/:id" element={<ExhibitionCheckout />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <ChatBot />
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;
