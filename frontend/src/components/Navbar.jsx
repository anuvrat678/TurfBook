import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

function Navbar() { 
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mobileMenuVariants = {
    open: { x: 0 },
    closed: { x: '100%' } // Right-side animation
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-3xl font-bold">
            <span className="text-green-500">Turf</span>
            <span className={`${scrolled ? 'text-gray-800' : 'text-white'}`}>
              Book
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`custom-nav-link ${scrolled ? 'text-gray-600' : 'text-white'} hover:text-green-500 transition-colors font-medium`}
            >
              Home
            </Link>
            <Link
              to="/grounds"
              className={`custom-nav-link ${scrolled ? 'text-gray-600' : 'text-white'} hover:text-green-500 transition-colors font-medium`}
            >
              Grounds
            </Link>
            <Link
              to="/about"
              className={`custom-nav-link ${scrolled ? 'text-gray-600' : 'text-white'} hover:text-green-500 transition-colors font-medium`}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className={`custom-nav-link ${scrolled ? 'text-gray-600' : 'text-white'} hover:text-green-500 transition-colors font-medium`}
            >
              Contact Us
            </Link>
            <Link
              to="/privacypolicy"
              className={`custom-nav-link ${scrolled ? 'text-gray-600' : 'text-white'} hover:text-green-500 transition-colors font-medium`}
            >
              Privacy Policy
            </Link>

            {user ? (
              <div className="relative group">
                <div className="flex items-center gap-2 cursor-pointer hover:text-green-500 transition-colors">
                  <User className="w-5 h-5" />
                  <span className={`${scrolled ? 'text-gray-600' : 'text-white'}`}> 
                   <Link  to="/dashboard"> {user.name} </Link>
                  </span>
                </div>
                <div className="absolute hidden group-hover:block right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left hover:block hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div> 
              </div>
            ) : (
              <div className="flex gap-4 items-center">
                {/* Login Link: Increased font size, text color set to green (as register bg) */}
                <Link
                  to="/login"
                  className="custom-nav-link text-green-500 hover:text-green-600 font-medium text-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 text-white px-6 py-2 rounded-full font-bold hover:bg-green-600 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className={`w-6 h-6 ${scrolled ? 'text-gray-600' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${scrolled ? 'text-gray-600' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            transition={{ type: 'tween' }}
            className="md:hidden fixed right-0 top-16 h-full w-64 bg-white shadow-lg"
          >
            <div className="flex flex-col p-4 gap-2">
              <Link
                to="/"
                className="custom-nav-link block px-3 py-2 text-gray-600 hover:text-green-500 hover:bg-gray-50 rounded-md font-medium"
              >
                Home
              </Link>
              <Link
                to="/grounds"
                className="custom-nav-link block px-3 py-2 text-gray-600 hover:text-green-500 hover:bg-gray-50 rounded-md font-medium"
              >
                Grounds
              </Link>
              <Link
                to="/about"
                className="custom-nav-link block px-3 py-2 text-gray-600 hover:text-green-500 hover:bg-gray-50 rounded-md font-medium"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="custom-nav-link block px-3 py-2 text-gray-600 hover:text-green-500 hover:bg-gray-50 rounded-md font-medium"
              >
                Contact Us
              </Link>
              <Link
                to="/privacypolicy"
                className="custom-nav-link block px-3 py-2 text-gray-600 hover:text-green-500 hover:bg-gray-50 rounded-md font-medium"
              >
                Privacy
              </Link>

              {user ? (
                <>
                  <div className="p-2 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {user.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="custom-nav-link block px-3 py-2 text-red-600 hover:text-red-700 rounded-md font-medium"
                  >
                    <LogOut className="w-5 h-5 mr-2 inline-block" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* Mobile Login Link with increased font size */}
                  <Link
                    to="/login"
                    className="custom-nav-link block px-3 py-2 text-green-500 hover:text-green-600 rounded-md font-medium text-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="custom-nav-link block px-3 py-2 bg-green-500 text-white hover:bg-green-600 rounded-md font-bold"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
