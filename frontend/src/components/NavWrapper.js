import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

function NavWrapper() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {!hideNavbar && <Navbar />}
    </>
  );
}

export default NavWrapper; 