const WishList = require('../models/WishList.model');
const { analyzeImageForProduct, analyzeShopeeUrl } = require('./gemini.service');
const logger = require('../utils/logger');

class WishListService {
  async getAll() {
    try {
      const items = await WishList.find()
        .sort({ purchased: 1, priority: -1, createdAt: -1 })
        .lean();
      return items;
    } catch (error) {
      logger.error('WishList getAll error:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const { name, note, imageUrl, shopeeUrl, price, priority } = data;
      if (!name) throw new Error('Tên sản phẩm không được để trống');

      const item = await WishList.create({ name, note, imageUrl, shopeeUrl, price, priority });
      logger.info(`WishList item created: ${item._id}`);
      return item;
    } catch (error) {
      logger.error('WishList create error:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const item = await WishList.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!item) throw new Error('Không tìm thấy sản phẩm');
      logger.info(`WishList item updated: ${id}`);
      return item;
    } catch (error) {
      logger.error('WishList update error:', error);
      throw error;
    }
  }

  async markPurchased(id, purchased) {
    try {
      const updateData = {
        purchased,
        purchasedAt: purchased ? new Date() : null
      };
      const item = await WishList.findByIdAndUpdate(id, updateData, { new: true });
      if (!item) throw new Error('Không tìm thấy sản phẩm');
      logger.info(`WishList item ${purchased ? 'purchased' : 'unpurchased'}: ${id}`);
      return item;
    } catch (error) {
      logger.error('WishList markPurchased error:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const item = await WishList.findByIdAndDelete(id);
      if (!item) throw new Error('Không tìm thấy sản phẩm');
      logger.info(`WishList item deleted: ${id}`);
      return { message: 'Đã xóa sản phẩm khỏi danh sách' };
    } catch (error) {
      logger.error('WishList delete error:', error);
      throw error;
    }
  }

  async analyzeByImage(imageUrl) {
    try {
      logger.info('Analyzing product by image URL:', imageUrl);
      const result = await analyzeImageForProduct(imageUrl);
      return result;
    } catch (error) {
      logger.error('WishList analyzeByImage error:', error);
      throw error;
    }
  }

  async analyzeByUrl(shopeeUrl) {
    try {
      if (!shopeeUrl || !shopeeUrl.includes('shopee')) {
        throw new Error('URL không hợp lệ. Chỉ hỗ trợ link Shopee');
      }
      logger.info('Analyzing product by URL:', shopeeUrl);
      const result = await analyzeShopeeUrl(shopeeUrl);
      return result;
    } catch (error) {
      logger.error('WishList analyzeByUrl error:', error);
      throw error;
    }
  }
}

module.exports = new WishListService();
