import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { tokenUtils, apiClient } from "../utils/api";
import type { ApiResponse } from "../hooks";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const Appbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
 
  const isAuthenticated = tokenUtils.isValid();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  const fetchUser = async () => {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/api/v1/user/profile');
      if (response.data.success && response.data.data) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const handleLogout = () => {
    tokenUtils.remove();
    navigate('/landing');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Always links to /blogs for authenticated users */}
          <div className="flex items-center">
            <Link 
              to={isAuthenticated ? "/blogs" : "/landing"} 
              className="flex items-center space-x-2 group"
            >
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-200">
                ✍️ GitWrite
              </div>
            </Link>
          </div>

          {/* Right side: Publish Button and User Menu grouped together */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/publish"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm transform hover:scale-105"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                publish
              </Link>

              {/* User Menu */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
                >
                  <div className="relative">
                    <img
                      className="h-8 w-8 rounded-full ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-200"
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=3B82F6&color=fff&size=128`}
                      alt={user?.name || 'User'}
                    />
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 group-hover:text-gray-900">{user?.name || 'User'}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Enhanced Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-200 transform opacity-100 scale-100 transition-all duration-200">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                      <div className="flex items-center space-x-3">
                        <img
                          className="h-10 w-10 rounded-full ring-2 ring-white"
                          src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=3B82F6&color=fff&size=128`}
                          alt={user?.name || 'User'}
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                          <p className="text-xs text-gray-500">{user?.email || ''}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                        </svg>
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/publish"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Write Story</span>
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-2"></div>

                    {/* Logout */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/signin"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
