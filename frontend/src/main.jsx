import React from 'react';
import ReactDOM from 'react-dom/client';
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




ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
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
      <AdminLogin />
    ) : route === "adminProducts" ? (
      <AdminDashboard />
    ) : route === "adminProductsNew" ? (
      <AddEditProduct />
    ) : route === "adminProductsEdit" ? (
      <AddEditProduct />
) : route === "adminOrders" ? (
      <AdminDashboard />
    ) : (
      <Home />
    )}



  </React.StrictMode>
);

