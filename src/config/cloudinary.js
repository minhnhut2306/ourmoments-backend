const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary cho Images
const cloudinaryImage = cloudinary;
cloudinaryImage.config({
  cloud_name: process.env.CLOUDINARY_IMAGE_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_IMAGE_API_KEY,
  api_secret: process.env.CLOUDINARY_IMAGE_API_SECRET
});

// Tạo instance riêng cho Videos (clone từ cloudinary.v2)
const cloudinaryVideo = Object.create(cloudinary);
cloudinaryVideo.config({
  cloud_name: process.env.CLOUDINARY_VIDEO_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_VIDEO_API_KEY,
  api_secret: process.env.CLOUDINARY_VIDEO_API_SECRET
});

module.exports = {
  cloudinaryImage,
  cloudinaryVideo
};