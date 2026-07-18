import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './home';
import Login from './Login';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import About from './About';
import Makeup from './Makeup';
import Skincare from './Skincare';

const pathname = window.location.pathname.replace(/\/+$/, '');
const route = pathname === '/login'
  ? 'login'
  : pathname === '/cart'
  ? 'cart'
  : pathname === '/checkout'
  ? 'checkout'
  : pathname === '/about'
  ? 'about'
  : pathname === '/makeup'
  ? 'makeup'
  : pathname === '/skincare'
  ? 'skincare'
  : 'home';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {route === 'login' ? (
      <Login />
    ) : route === 'cart' ? (
      <CartPage />
    ) : route === 'checkout' ? (
      <CheckoutPage />
    ) : route === 'about' ? (
      <About />
    ) : route === 'makeup' ? (
      <Makeup />
    ) : route === 'skincare' ? (
      <Skincare />
    ) : (
      <Home />
    )}
  </React.StrictMode>
);
