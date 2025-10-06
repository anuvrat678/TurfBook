import multer from 'multer';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Multer Configuration
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, WEBP)'), false);
    }
  }
}).array('gallery', 8);

export const processUploadedFiles = async (files) => {
  try {
    if (!files?.length) return [];
    
    return Promise.all(
      files.map(async file => {
        const result = await uploadToCloudinary(file.buffer);
        return result.secure_url;
      })
    );
  } catch (error) {
    console.error('File processing error:', error);
    throw new Error('Failed to process uploaded files');
  }
};

// Middleware: Process Ground Data
export const processGroundData = async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const galleryUrls = await Promise.all(
      req.files.map(async file => {
        try {
          const result = await uploadToCloudinary(file.buffer);
          return result.secure_url;
        } catch (error) {
          console.error(`Failed to upload ${file.originalname}:`, error);
          throw new Error(`Failed to upload ${file.originalname}`);
        }
      })
    );

    req.groundData = {
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
      gallery: galleryUrls,
      cover: galleryUrls[0],
      createdBy: req.user._id,
      isActive: true // Default active status
    };

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ 
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};