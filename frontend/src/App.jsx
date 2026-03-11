import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // <-- 1. Import Footer
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Philosophy from './pages/Philosophy';
import Consultations from './pages/Consultations';

// Admin Imports
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products'; // <-- Import
import AdminOrders from './pages/admin/Orders';     // <-- Import
import AdminSettings from './pages/admin/Settings'; // <-- Import

const PublicLayout = () => {
  return (
    // Added flex classes here to keep footer at the bottom!
    <div className="flex flex-col min-h-screen"> 
      <Navbar />
      <main className="flex-1 pt-20"> {/* flex-1 pushes footer down */}
        <Outlet />
      </main>
      <Footer /> {/* <-- 2. Drop Footer here */}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        
        {/* PUBLIC ROUTES */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/philosophy" element={<Philosophy />} />
          <Route path="/contact" element={<Consultations />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} /> {/* <-- Add Route */}
          <Route path="orders" element={<AdminOrders />} />     {/* <-- Add Route */}
          <Route path="settings" element={<AdminSettings />} /> {/* <-- Add Route */}
        </Route>

      </Routes>
    </Router>
  );
}

export default App;