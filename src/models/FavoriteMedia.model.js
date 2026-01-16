const mongoose = require('mongoose');

const favoriteMediaSchema = new mongoose.Schema({
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: [true, 'Media ID không được để trống']
  },
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

favoriteMediaSchema.index({ mediaId: 1 }, { unique: true });

module.exports = mongoose.model('FavoriteMedia', favoriteMediaSchema);