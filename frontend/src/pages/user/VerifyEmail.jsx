import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Mail, ArrowRight, Home, UserCheck } from 'lucide-react';
import api from '../../services/api';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      console.log('🔑 Frontend - Token from URL:', token);
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link - no token found');
        return;
      }

      try {
        console.log('🔄 Frontend - Making API call...');
        const response = await api.get(`/auth/verify-email?token=${token}`);
        
        console.log('✅ Frontend - API Response:', response);
        console.log('✅ Frontend - Response data:', response.data);
        console.log('✅ Frontend - Response status:', response.status);
        
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message);
          
          // Auto-redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Verification failed');
        }
        
      } catch (error) {
        console.error('❌ Frontend - API Error:', error);
        console.error('❌ Frontend - Error response:', error.response);
        
        // More detailed error handling
        if (error.response) {
          // Server responded with error status
          console.error('❌ Frontend - Error status:', error.response.status);
          console.error('❌ Frontend - Error data:', error.response.data);
          
          if (error.response.status === 400) {
            setStatus('error');
            setMessage(error.response.data.message || 'Invalid or expired token');
          } else if (error.response.status === 500) {
            setStatus('error');
            setMessage('Server error. Please try again later.');
          } else {
            setStatus('error');
            setMessage(error.response.data?.message || 'Verification failed');
          }
        } else if (error.request) {
          // Request was made but no response received
          console.error('❌ Frontend - No response received:', error.request);
          setStatus('error');
          setMessage('Network error. Please check your connection.');
        } else {
          // Something else happened
          console.error('❌ Frontend - Other error:', error.message);
          setStatus('error');
          setMessage('An unexpected error occurred.');
        }
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <span className="text-3xl font-bold">
              <span className="text-green-500">Turf</span>
              <span className="text-gray-800">Book</span>
            </span>
          </Link>
        </div>

        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
            <p className="text-gray-600 mb-4">Please wait while we verify your email address...</p>
            <div className="mt-4">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified Successfully!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-4">
              Redirecting to login page in 3 seconds...
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Go to Login
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                to="/resend-verification"
                className="w-full block py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Resend Verification Email
              </Link>
              <Link
                to="/login"
                className="w-full block py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Login
              </Link>
              <Link
                to="/"
                className="w-full block py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Homepage
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default VerifyEmail;