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
import ProductsDashboard from './admin-products/ProductsDashboard';
import ProductsTable from './admin-products/ProductsTable';
import AddEditProduct from './admin-products/AddEditProduct';
import AdminLogin from './admin-products/AdminLogin';
import AdminLayout from './admin-products/AdminLayout';
import AuthCallback from './AuthCallback';

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
              : pathname === "/orders" || pathname === "/orders.html"
                ? "orders"
                : pathname === "/product" || pathname === "/product.html"
                  ? "product"
                  : pathname === "/auth/callback"
                    ? "authCallback"
                    : pathname === "/admin/login"
                      ? "adminLogin"
                      : pathname === "/admin" || pathname === "/admin/dashboard"
                        ? "adminDashboard"
                        : pathname === "/admin/products" || pathname === "/admin/products.html"
                          ? "adminProducts"
                          : pathname === "/admin/products/new" || pathname === "/admin/products/new.html"
                            ? "adminProductsNew"
                            : pathname === "/admin/products/edit" || pathname === "/admin/products/edit.html"
                              ? "adminProductsEdit"
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
    ) : route === "authCallback" ? (
      <AuthCallback />
    ) : route === "adminLogin" ? (
      <AdminLogin />
    ) : route === "adminDashboard" ? (
      <AdminLayout>
        <ProductsDashboard />
      </AdminLayout>
    ) : route === "adminProducts" ? (
      <AdminLayout>
        <ProductsTable />
      </AdminLayout>
    ) : route === "adminProductsNew" ? (
      <AdminLayout>
        <AddEditProduct />
      </AdminLayout>
    ) : route === "adminProductsEdit" ? (
      <AdminLayout>
        <AddEditProduct />
      </AdminLayout>
    ) : (
      <Home />
    )}
  </React.StrictMode>
);