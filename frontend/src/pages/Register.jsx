import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { User, Mail, Lock, Github, Linkedin, Twitter, ExternalLink, Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const password = watch("password");
  
const handleRegistration = async (data) => {
  try {
    setIsLoading(true);
    setError("");
    
    console.log("Sending registration data:", data);
    
    const response = await api.post("/auth/register", {
      name: data.name,
      email: data.email,
      password: data.password,
    });
    
    console.log("Registration response:", response);
    
    // Fix: Check response.data directly since axios wraps the response
    if (response.data && response.data.success) {
      alert(response.data.message);
      navigate("/login");
    } else {
      // If no success field, check for other response formats
      if (response.data.message) {
        setError(response.data.message);
      } else {
        setError('Registration completed. Please check your email for verification.');
        navigate("/login");
      }
    }
  } catch (err) {
    console.error("Registration error:", err);
    
    // More detailed error handling
    if (err.response) {
      // Server responded with error status
      if (err.response.data.errors) {
        // Validation errors from express-validator
        const validationErrors = err.response.data.errors.map(error => error.msg).join(', ');
        setError(validationErrors);
      } else if (err.response.data.message) {
        // General error message
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } else if (err.request) {
      // Request was made but no response received
      setError('Network error. Please check your connection.');
    } else {
      // Something else happened
      setError('An unexpected error occurred.');
    }
  } finally {
    setIsLoading(false);
  }
};

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setError("");
      await login({ googleToken: credentialResponse.credential });
    } catch (err) {
      setError("Google registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20"
      >
        {/* Logo - Consistent with Home & Grounds pages */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <span className="text-3xl font-bold">
              <span className="text-green-500 group-hover:text-green-600 transition-colors">Turf</span>
              <span className="text-gray-800 group-hover:text-gray-900 transition-colors">Book</span>
            </span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Join our sports community</p>
        </motion.div>

        <div className="space-y-6">
          <motion.header variants={itemVariants} className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">Sign up to start booking sports grounds</p>
          </motion.header>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(handleRegistration)} className="space-y-4">
            <motion.div variants={itemVariants} className="space-y-4">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  <input
                    id="name"
                    type="text"
                    {...register("name", {
                      required: "Full name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.name.message}
                  </motion.p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  <input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === password || "The passwords do not match",
                    })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </div>
            </motion.div>

            

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={isLoading || isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </motion.button>
          </form>

          {/* Social Login Divider */}
          <motion.div variants={itemVariants} className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">Or sign up with</span>
            </div>
          </motion.div>

          {/* Google Login */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google registration was canceled")}
                useOneTap={false}
                shape="pill"
                size="medium"
                width="100%"
                theme="filled_blue"
                text="signup_with"
              />
            </GoogleOAuthProvider>
          </motion.div>

          {/* Sign In Link */}
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-green-600 hover:text-green-700 transition-colors inline-flex items-center space-x-1 group"
              >
                <span>Sign in here</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Portfolio Attribution */}
        <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-3">A portfolio project by</p>
            <div className="flex items-center justify-center space-x-2 mb-3">
              <span className="text-sm font-medium text-gray-700">Anuvrat Rajpurohit</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </div>
            <div className="flex justify-center space-x-4">
              <a
                href="https://github.com/anuvrat678"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/anuvrat-rajpurohit-a4b3b7251/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/anuvrat678"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Register;