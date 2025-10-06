import express from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Google OAuth
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: 'google-auth',
        authProvider: 'google',
        avatar: picture,
        verified: true
      });
    }

    const authToken = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: authToken
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(400).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message
    });
  }
});

// Auth check
router.get('/check', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (error) {
    console.error('Auth Check Error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.message.includes('JWT secret')) {
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    res.status(500).json({ message: 'Authentication check failed' });
  }
});

// Register with email verification
router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;
      const userExists = await User.findOne({ email });

      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const user = await User.create({ 
        name, 
        email, 
        password,
        verificationToken,
        verificationTokenExpires
      });

      await sendVerificationEmail(email, verificationToken, name);

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// Login with email verification check
router.post('/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      if (user.authProvider === 'local' && !user.verified) {
        return res.status(401).json({ 
          message: 'Please verify your email before logging in' 
        });
      }

      const token = generateToken(user._id);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// Email Verification
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'No verification token provided'
      });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      user: {
        email: user.email,
        verified: user.verified
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
});

// Resend Verification Email
router.post('/resend-verification',
  [
    body('email').isEmail().withMessage('Please enter a valid email')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found with this email'
        });
      }

      if (user.verified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified'
        });
      }

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      user.verificationToken = verificationToken;
      user.verificationTokenExpires = verificationTokenExpires;
      await user.save();

      await sendVerificationEmail(email, verificationToken, user.name);

      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });

    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while resending verification email'
      });
    }
  }
);

// Forgot Password
router.post('/forgot-password',
  [
    body('email').isEmail().withMessage('Please enter a valid email')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent'
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpires;
      await user.save();

      await sendPasswordResetEmail(email, resetToken, user.name);

      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while processing forgot password'
      });
    }
  }
);

// Reset Password
router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token, password } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while resetting password'
      });
    }
  }
);

export default router;