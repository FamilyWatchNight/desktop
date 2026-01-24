import React, { useState } from 'react';
import '../styles/Layout.css';
import HomePage from './HomePage';
import SettingsPage from './SettingsPage';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    closeMenu();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="app-layout">
      {/* Hamburger Menu Button */}
      <button className="hamburger-button" onClick={toggleMenu} aria-label="Toggle menu">
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
      </button>

      {/* Overlay */}
      {menuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}

      {/* Side Menu */}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <div className="menu-content">
          {/* Scrollable Navigation Items */}
          <div className="menu-nav-section">
            <nav className="menu-nav">
              <button
                className={`menu-item ${currentPage === 'home' ? 'active' : ''}`}
                onClick={() => navigateTo('home')}
              >
                <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Home</span>
              </button>
            </nav>
          </div>

          {/* Settings at Bottom */}
          <div className="menu-footer">
            <button
              className={`menu-item ${currentPage === 'settings' ? 'active' : ''}`}
              onClick={() => navigateTo('settings')}
            >
              <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m-4.242 0l-4.243 4.243m4.242-4.242l4.243-4.243m-4.242 4.242l-4.243 4.243"></path>
              </svg>
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  );
}
