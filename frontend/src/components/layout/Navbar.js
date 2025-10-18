import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { 
  Recycle, 
  User, 
  Menu, 
  X, 
  Bell, 
  MessageCircle,
  Plus,
  LogOut,
  Settings,
  Home as HomeIcon,
  Info,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import Notifications from '../Notifications';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const currentPath = window.location.pathname;

  const publicLinks = [
    { to: '/home', label: 'Home', Icon: HomeIcon },
    { to: '/about', label: 'About', Icon: Info },
    { to: '/impact', label: 'Impact', Icon: TrendingUp },
    { to: '/faq', label: 'FAQ', Icon: HelpCircle },
  ];

  const isActive = (to) => {
    if (to === '/') return currentPath === '/';
    return currentPath.startsWith(to);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/home" className="flex items-center space-x-2">
              <Recycle className="h-8 w-8 text-primary" style={{color: '#8dc6ff'}} />
              <span className="text-xl font-bold text-gray-900">TrashToTreasure</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Public links (visible for everyone) */}
            {publicLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${isActive(link.to) ? 'bg-green-50 text-green-700 ring-1 ring-green-100' : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'}`}
              >
                <link.Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            ))}
            {/* Hide Browse Waste on the public landing, login and register pages to simplify title bar */}
            {/* Browse/List removed for generator-focused UX */}

            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link to="/admin/prices" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                    Admin
                  </Link>
                )}
                <Link to="/dashboard" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                {/* List Waste removed from main nav; creation is available from dashboard */}
                
                {/* Notifications dropdown */}
                <div className="relative">
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="relative p-2 text-gray-700 hover:text-green-600">
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {/* Notifications dropdown anchored to bell */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 z-50">
                      <Notifications />
                    </div>
                  )}
                </div>

                {/* Messages */}
                <Link to="/messages" className="p-2 text-gray-700 hover:text-green-600">
                  <MessageCircle className="h-6 w-6" />
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-green-600 p-2 rounded-md"
                  >
                    <User className="h-6 w-6" />
                    <span className="text-sm font-medium">{user?.username}</span>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/transactions"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Transactions
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  <User className="h-4 w-4 inline mr-2" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Sign up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-green-600 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {/* Browse Waste removed from mobile menu for generator-focused UX */}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2"><HomeIcon className="h-4 w-4" /> <span>Dashboard</span></div>
                  </Link>
                  {/* List Waste hidden in mobile nav; use dashboard to create listings */}
                  <Link
                    to="/messages"
                    className="block text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> <span>Messages</span></div>
                  </Link>
                  <Link
                    to="/profile"
                    className="block text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2"><User className="h-4 w-4" /> <span>Profile</span></div>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block bg-green-600 text-white hover:bg-green-700 px-3 py-3 rounded-lg text-base font-semibold mx-3 mt-2 text-center transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🚀 Join TrashToTreasure Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;