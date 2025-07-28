import React, { useState, useEffect } from 'react';
import { User, ChevronDown, LogOut, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // console.log("Session user:", userData);
        setUser(userData);
      } catch (err) {
        console.error("Failed to parse user from sessionStorage:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Left menu links - Hidden on mobile */}
          <div className="hidden sm:flex items-center space-x-8">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">
              Home
            </Link>
            <Link to="/use" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">
              How To Use
            </Link>
          </div>

          {/* Center logo */}
          <div className="text-gray-800 font-bold text-xl sm:text-2xl tracking-wide">
            XAVOR
          </div>

          {/* Right user menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-gray-900 transition-colors py-2 px-2 sm:px-3 rounded-lg hover:bg-gray-50"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User size={14} className="sm:w-4 sm:h-4" />
                </div>
                <span className="hidden sm:inline font-medium text-sm">{user?.name ?? 'User'}</span>
                <ChevronDown size={12} className={`sm:w-3.5 sm:h-3.5 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu */}
        <div className={`sm:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="py-3 space-y-1 border-t border-gray-100">
            <Link 
              to="/dashboard" 
              className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors text-sm rounded-lg mx-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/use" 
              className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors text-sm rounded-lg mx-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How To Use
            </Link>
            {user && (
              <div className="px-2 pt-2 border-t border-gray-100 mt-2">
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 mt-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 rounded-lg mx-2"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside overlay for closing menus */}
      {(isUserMenuOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-5 z-30"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsMobileMenuOpen(false);
          }}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;