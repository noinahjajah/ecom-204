import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './home';
import Login from './Login';
import Skincare from './Skincare';
import Makeup from './Makeup';
import About from './About';

const pathname = window.location.pathname.replace(/\/+$/, '');
const route =
  pathname === '/login' ? 'login' :
  pathname === '/skincare' ? 'skincare' :
  pathname === '/makeup' ? 'makeup' :
  pathname === '/about' ? 'about' :
  'home';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {route === 'login' ? <Login />
      : route === 'skincare' ? <Skincare />
      : route === 'makeup' ? <Makeup />
      : route === 'about' ? <About />
      : <Home />}
  </React.StrictMode>
);