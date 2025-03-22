const logger = require('./logger');

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your environment variables
// cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteImage = async (publicId) => {
  const result = await cloudinary.uploader.destroy(publicId);
  logger.info('Image deleted from Cloudinary:', result);
  return result;
};

module.exports = { deleteImage };
