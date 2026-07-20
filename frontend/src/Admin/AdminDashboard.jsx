import React from "react";
import "./styles/admin.css";
import AdminLayout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import OverviewPage from "./pages/OverviewPage";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/ProductsPage";

function getTabFromPath() {
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path === "/admin/orders") return "orders";
  if (path === "/admin/products") return "products";
  return "overview";
}

export default function AdminDashboard() {
  const tab = getTabFromPath();

  return (
    <ErrorBoundary>
      <AdminLayout activeTab={tab}>
        {tab === "overview" && <OverviewPage />}
        {tab === "orders" && <OrdersPage />}
        {tab === "products" && <ProductsPage />}
      </AdminLayout>
    </ErrorBoundary>
  );
}

