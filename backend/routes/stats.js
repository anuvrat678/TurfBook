import express from 'express';
import Booking from '../models/Booking.js';
import Ground from '../models/Ground.js';
import User from '../models/User.js';

const router = express.Router();

// Get dashboard stats
router.get('/admin/stats', async (req, res) => {
  try {
    const [totalRevenue, totalGrounds, activeBookings, totalUsers, revenueTrends, bookingTrends] = await Promise.all([
      Booking.aggregate([{ $match: { status: 'confirmed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Ground.countDocuments(),
      Booking.countDocuments({ status: 'confirmed', date: { $gte: new Date() } }),
      User.countDocuments({ role: 'user' }),
      Booking.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$totalAmount' } } },
        { $sort: { _id: 1 } }
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalGrounds,
      activeBookings,
      totalUsers,
      revenueTrends,
      bookingTrends
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent bookings
router.get('/admin/recent-bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('ground', 'name')
      .populate('user', 'name');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chart data
router.get('/admin/chart-data', async (req, res) => {
  try {
    const today = new Date();
    const startDate = new Date(today.setDate(today.getDate() - 30));

    const bookingTrends = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { 
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    const revenueData = await Booking.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate },
          status: 'confirmed'
        }
      },
      { $group: { 
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        amount: { $sum: '$totalAmount' }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({
      bookingTrends: bookingTrends.map(item => ({ date: item._id, count: item.count })),
      revenueData: revenueData.map(item => ({ date: item._id, amount: item.amount }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin/analytics', async (req, res) => {
  try {
    const [totalRevenue, totalBookings, activeGrounds, newUsers, revenueTrend, bookingTrend, topGrounds] = await Promise.all([
      Booking.aggregate([{ $match: { status: 'confirmed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Booking.countDocuments({ status: 'confirmed' }),
      Ground.countDocuments({ isActive: true }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      Booking.aggregate([
        { 
          $match: { 
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            status: 'confirmed'
          }
        },
        { 
          $group: { 
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            amount: { $sum: '$totalAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Booking.aggregate([
        { 
          $match: { 
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        { 
          $group: { 
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Ground.aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: 'bookings',
            localField: '_id',
            foreignField: 'ground',
            as: 'bookings'
          }
        },
        {
          $project: {
            name: 1,
            cover: 1,
            bookings: { $size: '$bookings' },
            totalRevenue: { $sum: '$bookings.totalAmount' }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalBookings,
      activeGrounds,
      newUsers,
      revenueTrend: revenueTrend.map(item => ({ date: item._id, amount: item.amount })),
      bookingTrend: bookingTrend.map(item => ({ date: item._id, count: item.count })),
      topGrounds,
      recentActivity: [] // Add your activity tracking logic
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;