const mongoose = require('mongoose');

const wishListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên sản phẩm không được để trống'],
    trim: true
  },
  note: {
    type: String,
    default: '',
    trim: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  shopeeUrl: {
    type: String,
    default: null
  },
  price: {
    type: String,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  purchased: {
    type: Boolean,
    default: false
  },
  purchasedAt: {
    type: Date,
    default: null
  },
  aiAnalyzed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

wishListSchema.index({ purchased: 1, priority: 1, createdAt: -1 });

module.exports = mongoose.model('WishList', wishListSchema);
