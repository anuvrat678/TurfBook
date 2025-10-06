import express from 'express';
import { upload, processGroundData, processUploadedFiles } from '../middleware/upload.js'; 
import { protect, adminCheck } from '../middleware/auth.js';
import Ground from '../models/Ground.js';

const router = express.Router();



// ======================
// Public Routes
// ======================

// Get all grounds
router.get('/', async (req, res) => {
  try {
    const grounds = await Ground.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json(grounds.map(ground => ({
      ...ground,
      price: ground.price.toFixed(2),
      location: ground.location // Full location details
    })));
  } catch (error) {
    console.error('Get grounds error:', error);
    res.status(500).json({ 
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error })
    });
  }
});

// Get single ground
router.get('/:id', async (req, res) => {
  try {
    const ground = await Ground.findOne({ 
      _id: req.params.id,
      isActive: true
    }).populate('createdBy', 'name email').lean();

    if (!ground) return res.status(404).json({ message: 'Ground not found' });

    res.json({
      ...ground,
      price: ground.price
    });
  } catch (error) {
    console.error('Get ground error:', error);
    res.status(500).json({ 
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error })
    });
  }
});

// ======================
// Admin Routes
// ======================

// Create new ground
router.post('/', 
  protect, 
  adminCheck,
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  },
  processGroundData,
  async (req, res) => {
    try {
      const ground = await Ground.create(req.groundData);
      res.status(201).json(ground);
    } catch (error) {
      console.error('Create ground error:', error);
      res.status(400).json({ 
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { error })
      });
    }
  }
);

// Toggle ground status
router.patch('/:id/status', protect, adminCheck, async (req, res) => {
  try {
    const ground = await Ground.findById(req.params.id);
    if (!ground) return res.status(404).json({ message: 'Ground not found' });

    ground.isActive = !ground.isActive;
    await ground.save();
    
    res.json({ 
      message: `Ground ${ground.isActive ? 'activated' : 'deactivated'}`,
      isActive: ground.isActive
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ 
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error })
    });
  }
});

// Delete ground
router.delete('/:id', protect, adminCheck, async (req, res) => {
  try {
    const ground = await Ground.findByIdAndDelete(req.params.id);
    if (!ground) return res.status(404).json({ message: 'Ground not found' });

    res.json({ message: 'Ground permanently deleted' });
  } catch (error) {
    console.error('Delete ground error:', error);
    res.status(500).json({ 
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error })
    });
  }
});

// Update ground route
// Update ground route
router.put('/:id', 
  protect, 
  adminCheck,
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  },
  async (req, res) => {
    try {
      // Process existing and new images
      const existingGallery = JSON.parse(req.body.existingGallery || '[]');
      const newGallery = await processUploadedFiles(req.files);
      const fullGallery = [...existingGallery, ...newGallery];

      // Validate there's at least one image
      if (fullGallery.length === 0) {
        return res.status(400).json({ message: 'At least one image required' });
      }

      // Prepare update data
      const updatedData = {
        name: req.body.name,
        description: req.body.description,
        price: parseFloat(req.body.price),
        openingTime: req.body.openingTime,
        closingTime: req.body.closingTime,
        is24x7: req.body.is24x7 === 'true',
        location: {
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          pincode: req.body.pincode,
          landmark: req.body.landmark
        },
        gallery: fullGallery,
        cover: fullGallery[0], // First image is always cover
      };

      // Perform update
      const ground = await Ground.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true, runValidators: true }
      );

      if (!ground) return res.status(404).json({ message: 'Ground not found' });
      res.json(ground);
    } catch (error) {
      console.error('Update ground error:', error);
      res.status(400).json({ 
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
  }
);

export default router;