import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './AuthContext';
import Home from './home';
import Login from './Login';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import About from './About';
import Makeup from './Makeup';
import Skincare from './Skincare';
import OrdersPage from './OrdersPage';
import ProductDetailPage from './ProductDetailPage';
import AddEditProduct from './admin/pages/AddEditProduct';
import AdminDashboard from './admin/AdminDashboard';
import AdminLogin from './admin/AdminLogin';


const pathname = window.location.pathname.replace(/\/+$/, "");


const route =
  pathname === "/login"
    ? "login"
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
      : pathname === "/admin"
        ? "adminOrders"
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
    window.location.href = "/admin/orders";
    return null;
  }

  return <AdminLogin />;
}


function App() {
  return (
    <AuthProvider>
      {route === "login" ? (
        <Login />
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
      ) : route === "adminProducts" ? (
        <AdminRoute><AdminDashboard /></AdminRoute>
      ) : route === "adminProductsNew" ? (
        <AdminRoute><AddEditProduct /></AdminRoute>
      ) : route === "adminProductsEdit" ? (
        <AdminRoute><AddEditProduct /></AdminRoute>
      ) : route === "adminOrders" ? (
        <AdminRoute><AdminDashboard /></AdminRoute>
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

