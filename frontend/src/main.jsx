import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Imports ของ User
import Home from './home';
import Login from './Login';
import Skincare from './User/Skincare';
import Makeup from './User/Makeup';
import About from './User/About';
import Account from './User/Account';
import AuthCallback from './AuthCallback';

// Imports ของ Admin
import AdminLogin from './Admin/AdminLogin';
import AdminDashboard from './Admin/AdminDashboard';
import AdminLayout from './Admin/AdminLayout'; 
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ===== User Routes ===== */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/skincare" element={<Skincare />} />
        <Route path="/makeup" element={<Makeup />} />
        <Route path="/about" element={<About />} />
        <Route path="/account" element={<Account />} />
        
        {/* ===== Auth Route ===== */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* ===== Admin Routes ===== */}
        {/* หน้า Login แอดมิน ไม่ต้องโดนครอบ เพราะยังไม่ได้ล็อกอิน */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* หน้าต่างๆ ของแอดมินที่ต้องผ่านการล็อกอิน (Protected Routes) */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* อนาคตถ้ามีหน้าอื่นเพิ่ม เช่น หน้าลูกค้า หน้าสินค้า ให้นำ Route มาใส่เพิ่มใน Block นี้ได้เลยครับ */}
          {/* <Route path="/admin/products" element={<AdminProducts />} /> */}
          {/* <Route path="/admin/customers" element={<AdminCustomers />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);