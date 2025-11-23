import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinkClass = (path: string) => {
    const baseClass =
      'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200';
    return isActive(path)
      ? `${baseClass} bg-primary-700 text-white`
      : `${baseClass} text-gray-100 hover:bg-primary-700 hover:text-white`;
  };

  return (
    <header className="bg-primary-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/routes" className="flex items-center">
              <span className="text-2xl mr-2" aria-hidden="true">
                ✈️
              </span>
              <span className="text-xl font-bold text-white">Enes Airlines</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4" aria-label="Main navigation">
            <Link to="/routes" className={navLinkClass('/routes')} aria-current={isActive('/routes') ? 'page' : undefined}>
              Search Routes
            </Link>

            {isAdmin && (
              <>
                <Link
                  to="/locations"
                  className={navLinkClass('/locations')}
                  aria-current={isActive('/locations') ? 'page' : undefined}
                >
                  Locations
                </Link>
                <Link
                  to="/transportations"
                  className={navLinkClass('/transportations')}
                  aria-current={isActive('/transportations') ? 'page' : undefined}
                >
                  Transportations
                </Link>
              </>
            )}
          </nav>

          {/* User info and logout */}
          <div className="flex items-center space-x-4">
            <div className="text-white text-sm">
              <span className="font-medium">{user?.username}</span>
              {isAdmin && <span className="ml-2 badge badge-warning">ADMIN</span>}
            </div>
            <button
              onClick={logout}
              className="bg-primary-700 hover:bg-primary-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
