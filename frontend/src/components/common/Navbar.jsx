import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          DRX Issue Tracking
        </Link>
        <div className="navbar-menu">
          <Link 
            to="/submit" 
            className={`navbar-item ${location.pathname === '/submit' || location.pathname === '/' ? 'active' : ''}`}
          >
            Submit Issue
          </Link>
          <Link 
            to="/dashboard" 
            className={`navbar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Open Issues
          </Link>
          <Link 
            to="/past-issues" 
            className={`navbar-item ${location.pathname === '/past-issues' ? 'active' : ''}`}
          >
            Past Issues
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;