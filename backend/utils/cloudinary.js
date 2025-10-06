import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';

// Load environment variables first
config();

// Debug log to verify values
console.log('Cloudinary Config:', {
  cloud: process.env.CLOUDINARY_CLOUD_NAME?.slice(0, 2) + '***',
  key: process.env.CLOUDINARY_API_KEY?.slice(0, 2) + '***',
  secret: process.env.CLOUDINARY_API_SECRET ? '*****' : 'missing'
});

// Validate configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  throw new Error(`
    Missing Cloudinary configuration!
    Received:
    - CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? 'exists' : 'missing'}
    - API_KEY: ${process.env.CLOUDINARY_API_KEY ? 'exists' : 'missing'}
    - API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? 'exists' : 'missing'}
  `);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});


export const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        timeout: 60000 // 1 minute timeout
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Failed to upload image to Cloudinary'));
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};