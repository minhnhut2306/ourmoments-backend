const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|avi|mov|wmv|flv|mkv/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  const isImage = allowedImageTypes.test(extname.slice(1)) && mimetype.startsWith('image/');
  const isVideo = allowedVideoTypes.test(extname.slice(1)) && mimetype.startsWith('video/');

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp) hoặc video (mp4, avi, mov, wmv, flv, mkv)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 
  }
});

module.exports = upload;