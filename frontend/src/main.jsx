import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './home';
import Login from './Login';

const pathname = window.location.pathname.replace(/\/+$/, '');
const route = pathname === '/login' ? 'login' : 'home';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {route === 'login' ? <Login /> : <Home />}
  </React.StrictMode>
);
