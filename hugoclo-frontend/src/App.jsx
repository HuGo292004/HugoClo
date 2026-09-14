// ============================================================
// App.jsx — Root with routing: / (Home) | /auth (Auth)
// ============================================================

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import AuthPage from './pages/AuthPage/AuthPage';
import ProductsPage from './pages/ProductsPage/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import CartPage from './pages/CartPage/CartPage';
import MenPage from './pages/MenPage/MenPage';
import WomenPage from './pages/WomenPage/WomenPage';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AdminDashboard from './pages/AdminPage/AdminDashboard';
import AdminProductsPage from './pages/AdminPage/AdminProductsPage';
import PrivateAdminRoute from './components/PrivateAdminRoute';
import './index.css';

const antdTheme = {
  token: {
    colorPrimary: '#1a1a1a',
    colorLink:    '#1a1a1a',
    fontFamily:   "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    borderRadius: 8,
    colorBorder:  '#e5e5e5',
  },
};

/* ── Layout wrapper for pages that need the full site header/footer ── */
const MainLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 pt-[108px]" id="main-content" role="main">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ConfigProvider theme={antdTheme} locale={viVN}>
          <Routes>
            {/* Home — full header + footer */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <HomePage />
                </MainLayout>
              }
            />

            {/* Auth — minimal header, no site nav */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Products listing */}
            <Route
              path="/products"
              element={
                <MainLayout>
                  <ProductsPage />
                </MainLayout>
              }
            />

            {/* Product detail */}
            <Route
              path="/products/:id"
              element={
                <MainLayout>
                  <ProductDetailPage />
                </MainLayout>
              }
            />

            {/* Men */}
            <Route
              path="/men"
              element={
                <MainLayout>
                  <MenPage />
                </MainLayout>
              }
            />

            {/* Women */}
            <Route
              path="/women"
              element={
                <MainLayout>
                  <WomenPage />
                </MainLayout>
              }
            />

            {/* Cart */}
            <Route
              path="/cart"
              element={
                <MainLayout>
                  <CartPage />
                </MainLayout>
              }
            />

            {/* Admin — riêng biệt, không dùng MainLayout */}
            <Route
              path="/admin"
              element={
                <PrivateAdminRoute>
                  <AdminDashboard />
                </PrivateAdminRoute>
              }
            />

            {/* Admin Products */}
            <Route
              path="/admin/products"
              element={
                <PrivateAdminRoute>
                  <AdminProductsPage />
                </PrivateAdminRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<MainLayout><HomePage /></MainLayout>} />
          </Routes>
        </ConfigProvider>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
  );
}

export default App;
