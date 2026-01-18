const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'URL không được để trống'],
    trim: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: [true, 'Loại media không được để trống']
  },
  publicId: {
    type: String,
    required: true
  },
  thumbnail: {  
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
mediaSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Media', mediaSchema);