import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import PromoPopup from './components/PromoPopup';
import Footer from './components/Footer'; // <-- 1. Import Footer
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Philosophy from './pages/Philosophy';
import Consultations from './pages/Consultations';
import Resources from './pages/Resources';
import Seminars from './pages/Seminars';
import ScrollToTop from './components/ScrollToTop';
import ExitIntentPopup from './components/ExitIntentPopup';
import SocialProofTicker from './components/SocialProofTicker';
import AdminRoute from './components/AdminRoute';

// Admin Imports
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminSettings from './pages/admin/AdminSettings';
import AdminBlog from './pages/admin/AdminBlog';
import AdminConsultations from './pages/admin/AdminConsultations';
import AdminLeads from './pages/admin/AdminLeads';
import AdminFranchises from './pages/admin/AdminFranchises';
import AdminEvents from './pages/admin/AdminEvents';
import AdminAds from './pages/admin/AdminAds';
import AdminDocuments from './pages/admin/AdminDocuments';
import Blog from './pages/Blog';

import MeridianMap from './pages/MeridianMap';
import PrivacyPolicy from './pages/PrivacyPolicy'; 

const PublicLayout = () => {
  return (
    // Added flex classes here to keep footer at the bottom!
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-20"> {/* flex-1 pushes footer down */}
        <Outlet />
      </main>
      <ExitIntentPopup />
      <SocialProofTicker />
      <Footer /> {/* <-- 2. Drop Footer here */}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ToastProvider>
        <SettingsProvider>
          <CartProvider>
            <ScrollToTop />
            <Routes>

            {/* PUBLIC ROUTES */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/philosophy" element={<Philosophy />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/clinical-map" element={<MeridianMap />} />
              <Route path="/consultations" element={<Consultations />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/seminars" element={<Seminars />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
            </Route>

            {/* ADMIN LOGIN — standalone, no layout guard */}
            <Route path="/eden-secure-portal-hq/login" element={<AdminLogin />} />
            {/* ADMIN ROUTES — protected by AdminRoute and AdminLayout checks */}
            <Route 
              path="/eden-secure-portal-hq" 
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="franchises" element={<AdminFranchises />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="consultations" element={<AdminConsultations />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="regional-promos" element={<AdminAds />} />
              <Route path="documents" element={<AdminDocuments />} />
            </Route>

          </Routes>
        </CartProvider>
      </SettingsProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
