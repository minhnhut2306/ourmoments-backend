const { cloudinaryImage, cloudinaryVideo } = require('../config/cloudinary');
const Media = require('../models/Media.model');
const FavoriteMedia = require('../models/FavoriteMedia.model');
const logger = require('../utils/logger');

class MediaService {
  async saveMediaMetadata(mediaData) {
    try {
      const { url, type, publicId, thumbnail } = mediaData;
      
      if (!url || !publicId || !type) {
        throw new Error('Thiếu thông tin bắt buộc: url, publicId, type');
      }

      if (!['image', 'video'].includes(type)) {
        throw new Error('Type phải là "image" hoặc "video"');
      }

      const media = await Media.create({
        url,
        type,
        publicId,
        thumbnail: type === 'video' ? thumbnail : null
      });

      logger.info(`Media metadata saved: ${media._id} (${type})`);
      return media;
    } catch (error) {
      logger.error('Save metadata error:', error);
      throw error;
    }
  }

  // src/services/media.service.js

async getAllMedia(type = null) {
  try {
    const query = type ? { type } : {};

    const media = await Media.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const total = media.length;

    logger.info(`Get all media: ${total} items (type: ${type || 'all'})`);

    return {
      media,
      total
    };
  } catch (error) {
    logger.error('Get all media error:', error);
    throw error;
  }
}

  async getMediaById(id) {
    try {
      const media = await Media.findById(id);
      if (!media) {
        throw new Error('Media not found');
      }
      return media;
    } catch (error) {
      logger.error('Get media by id error:', error);
      throw error;
    }
  }

  async getImageMedia(page = 1, limit = 20) {
    return this.getAllMedia('image', page, limit);
  }

  async getVideoMedia(page = 1, limit = 20) {
    return this.getAllMedia('video', page, limit);
  }

  async updateMedia(id, updateData) {
    try {
      const media = await Media.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!media) {
        throw new Error('Media not found');
      }

      logger.info(`Media updated successfully: ${id}`);
      return media;
    } catch (error) {
      logger.error('Update media error:', error);
      throw error;
    }
  }

  async deleteMedia(id) {
    try {
      const media = await Media.findById(id);
      if (!media) {
        throw new Error('Media not found');
      }

      const cloudinary = media.type === 'video' ? cloudinaryVideo : cloudinaryImage;

      await cloudinary.uploader.destroy(media.publicId, {
        resource_type: media.type === 'video' ? 'video' : 'image'
      });

      await FavoriteMedia.deleteOne({ mediaId: id });
      await Media.findByIdAndDelete(id);

      logger.info(`Media deleted successfully: ${id}`);
      return { message: 'Xóa media thành công' };
    } catch (error) {
      logger.error('Delete media error:', error);
      throw error;
    }
  }
}

module.exports = new MediaService();