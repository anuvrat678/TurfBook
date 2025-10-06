import express from 'express';
import Booking from '../models/Booking.js';
import Ground from '../models/Ground.js';
import User from '../models/User.js';
import { protect, adminCheck  } from '../middleware/auth.js';

const router = express.Router();

router.get('/slots', async (req, res) => {
  try {
    const bookings = await Booking.find({
      ground: req.query.ground,
      date: new Date(req.query.date),
      status: 'confirmed'
    }).populate('ground', 'name openingTime closingTime is24x7');

    const slots = bookings.flatMap(b => b.timeSlots);
    res.json(slots);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching time slots',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get bookings by user ID
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId })
      .populate('ground', 'name location')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching user bookings',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    // Check for existing bookings
    const existingBookings = await Booking.find({
      ground: req.body.ground,
      date: new Date(req.body.date),
      timeSlots: { $in: req.body.timeSlots },
      status: 'confirmed'
    });

    if (existingBookings.length > 0) {
      const conflictingSlots = [...new Set(existingBookings.flatMap(b => b.timeSlots))];
      return res.status(409).json({
        message: 'Some slots are already booked',
        conflictingSlots
      });
    }

    // Create new booking
    const booking = await Booking.create({
      ...req.body,
      user: req.user.id,
      status: 'confirmed'
    });

    // Populate booking data
    const populatedBooking = await Booking.findById(booking._id)
      .populate('ground', 'name location openingTime closingTime price')
      .populate('user', 'name email');

    res.status(201).json({
      ...populatedBooking.toObject(),
      date: populatedBooking.date.toISOString().split('T')[0]
    });

  } catch (error) {
    res.status(400).json({
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


// Updated bookings route
router.get('/', protect, adminCheck, async (req, res) => {
  try {
    const { search = '', status = 'all' } = req.query;

    // Base query with status filter
    const baseQuery = {
      ...(status !== 'all' && { status })
    };

    // Aggregation pipeline for search
    const bookings = await Booking.aggregate([
      { $match: baseQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'grounds',
          localField: 'ground',
          foreignField: '_id',
          as: 'ground'
        }
      },
      { $unwind: '$ground' },
      {
        $match: {
          $or: [
            { 'user.name': { $regex: search, $options: 'i' } },
            { 'ground.name': { $regex: search, $options: 'i' } }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          'user.name': 1,
          'ground.name': 1,
          'ground.cover': 1,
          date: 1,
          timeSlots: 1,
          totalAmount: 1,
          status: 1,
          createdAt: 1
        }
      }
    ]);

    res.json(bookings);
  } catch (error) {
    console.error('Bookings Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Update booking status
router.patch('/:id/status', protect, adminCheck, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;


