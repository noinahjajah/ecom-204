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
    ) : route === "adminProducts" ? (
      <ProductsTable />
    ) : route === "adminProductsNew" ? (
      <AddEditProduct />
    ) : route === "adminProductsEdit" ? (
      <AddEditProduct />
    ) : (
      <Home />
    )}


  </React.StrictMode>
);

