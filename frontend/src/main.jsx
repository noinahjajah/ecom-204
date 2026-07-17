import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './home';
import Login from './Login';
import CartPage from './CartPage';

const pathname = window.location.pathname.replace(/\/+$/, '');
const route = pathname === '/login' ? 'login' : pathname === '/cart' ? 'cart' : 'home';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {route === 'login' ? <Login /> : route === 'cart' ? <CartPage /> : <Home />}
  </React.StrictMode>
);
