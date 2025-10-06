import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import groundsRoutes from './routes/grounds.js';
import bookingsRoutes from './routes/Booking.js';
import statsRouter from './routes/stats.js';
import { errorHandler } from './middleware/error.js';
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/grounds', groundsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api', statsRouter);

// Error handling
app.use(errorHandler);


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
