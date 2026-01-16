const FavoriteMedia = require('../models/FavoriteMedia.model');
const Media = require('../models/Media.model');
const logger = require('../utils/logger');

class FavoriteMediaService {
  async addFavorite(mediaId) {
    try {
      const media = await Media.findById(mediaId);
      
      if (!media) {
        throw new Error('Media not found');
      }

      if (media.type !== 'image') {
        throw new Error('Chỉ ảnh mới có thể được yêu thích');
      }

      const existingFavorite = await FavoriteMedia.findOne({ mediaId });
      if (existingFavorite) {
        throw new Error('Ảnh này đã có trong danh sách yêu thích');
      }

      const favorite = await FavoriteMedia.create({
        mediaId: media._id,
        url: media.url,
        publicId: media.publicId
      });

      logger.info(`Added to favorites: ${mediaId}`);
      return favorite;
    } catch (error) {
      logger.error('Add favorite error:', error);
      throw error;
    }
  }

  async getAllFavorites(page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const [favorites, total] = await Promise.all([
        FavoriteMedia.find()
          .populate('mediaId')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        FavoriteMedia.countDocuments()
      ]);

      return {
        favorites,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get all favorites error:', error);
      throw error;
    }
  }

  async getFavoriteById(id) {
    try {
      const favorite = await FavoriteMedia.findById(id).populate('mediaId');
      if (!favorite) {
        throw new Error('Favorite not found');
      }
      return favorite;
    } catch (error) {
      logger.error('Get favorite by id error:', error);
      throw error;
    }
  }

  async removeFavorite(id) {
    try {
      const favorite = await FavoriteMedia.findByIdAndDelete(id);
      
      if (!favorite) {
        throw new Error('Favorite not found');
      }

      logger.info(`Removed from favorites: ${id}`);
      return { message: 'Đã xóa khỏi danh sách yêu thích' };
    } catch (error) {
      logger.error('Remove favorite error:', error);
      throw error;
    }
  }

  async removeFavoriteByMediaId(mediaId) {
    try {
      const favorite = await FavoriteMedia.findOneAndDelete({ mediaId });
      
      if (!favorite) {
        throw new Error('Favorite not found');
      }

      logger.info(`Removed from favorites by mediaId: ${mediaId}`);
      return { message: 'Đã xóa khỏi danh sách yêu thích' };
    } catch (error) {
      logger.error('Remove favorite by mediaId error:', error);
      throw error;
    }
  }

  async checkIsFavorite(mediaId) {
    try {
      const favorite = await FavoriteMedia.findOne({ mediaId });
      return { isFavorite: !!favorite };
    } catch (error) {
      logger.error('Check is favorite error:', error);
      throw error;
    }
  }
}

module.exports = new FavoriteMediaService();