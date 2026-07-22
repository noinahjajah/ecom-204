import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './AuthContext';
import Home from './home';
import Login from './Login';
import Register from './Register';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import About from './About';
import Makeup from './Makeup';
import Skincare from './Skincare';
import OrdersPage from './OrdersPage';
import ProductDetailPage from './ProductDetailPage';
import AddEditProduct from './admin/pages/AddEditProduct';
import AdminDashboard from './admin/AdminDashboard';
import AdminLoginPage from './admin/AdminLogin';
import AuthCallback from './AuthCallback';
import AdminLoginNew from './admin-products/AdminLogin';
import ProductsDashboard from './admin-products/ProductsDashboard';
import ProductsTable from './admin-products/ProductsTable';
import AddEditProductNew from './admin-products/AddEditProduct';
import AdminLayout from './admin-products/AdminLayout';


const pathname = window.location.pathname.replace(/\/+$/, "");


const route =
  pathname === "/login"
    ? "login"
    : pathname === "/register"
      ? "register"
    : pathname === "/cart"
      ? "cart"
    : pathname === "/checkout"
      ? "checkout"
    : pathname === "/about"
      ? "about"
    : pathname === "/makeup"
      ? "makeup"
    : pathname === "/skincare"
      ? "skincare"
    : pathname === "/orders"
      ? "orders"
    : pathname === "/product"
      ? "product"
    : pathname === "/admin" || pathname === "/admin/dashboard"
      ? "adminDashboard"
    : pathname === "/admin/login"
      ? "adminLogin"
    : pathname === "/admin/products"
      ? "adminProducts"
    : pathname === "/admin/products/new"
      ? "adminProductsNew"
    : pathname === "/admin/products/edit"
      ? "adminProductsEdit"
    : pathname === "/admin/orders"
      ? "adminOrders"
    : pathname === "/auth/callback"
      ? "authCallback"
    : "home";


function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf7f2" }}>
        <p style={{ textAlign: "center", padding: "4rem", fontSize: "1.1rem", color: "#5c5549" }}>
          กำลังตรวจสอบสิทธิ์...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    window.location.href = "/admin/login";
    return null;
  }

  return children;
}


function ProtectedAdminLogin() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf7f2" }}>
        <p style={{ textAlign: "center", padding: "4rem", fontSize: "1.1rem", color: "#5c5549" }}>
          กำลังตรวจสอบสิทธิ์...
        </p>
      </div>
    );
  }

  // ถ้าเป็น Admin อยู่แล้ว ให้ไปหน้า Dashboard
  if (isAdmin) {
    window.location.href = "/admin/products";
    return null;
  }

  return <AdminLoginNew />;
}


function App() {
  return (
    <AuthProvider>
      {route === "login" ? (
        <Login />
      ) : route === "register" ? (
        <Register />
      ) : route === "cart" ? (
        <CartPage />
      ) : route === "checkout" ? (
        <CheckoutPage />
      ) : route === "about" ? (
        <About />
      ) : route === "makeup" ? (
        <Makeup />
      ) : route === "skincare" ? (
        <Skincare />
      ) : route === "orders" ? (
        <OrdersPage />
      ) : route === "product" ? (
        <ProductDetailPage />
      ) : route === "adminLogin" ? (
        <ProtectedAdminLogin />
      ) : route === "adminDashboard" ? (
        <AdminLayout><ProductsDashboard /></AdminLayout>
      ) : route === "adminProducts" ? (
        <AdminLayout><ProductsTable /></AdminLayout>
      ) : route === "adminProductsNew" ? (
        <AdminLayout><AddEditProductNew /></AdminLayout>
      ) : route === "adminProductsEdit" ? (
        <AdminLayout><AddEditProductNew /></AdminLayout>
      ) : route === "adminOrders" ? (
        <AdminLayout><ProductsTable /></AdminLayout>
      ) : route === "authCallback" ? (
        <AuthCallback />
      ) : (
        <Home />
      )}
    </AuthProvider>
  );
}


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
