const { cloudinaryImage, cloudinaryVideo } = require('../config/cloudinary');
const Media = require('../models/Media.model');
const FavoriteMedia = require('../models/FavoriteMedia.model');
const logger = require('../utils/logger');

class MediaService {
  async uploadMedia(file) {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }

      const isVideo = file.mimetype.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';
      
      // Chọn Cloudinary instance phù hợp
      const cloudinary = isVideo ? cloudinaryVideo : cloudinaryImage;

      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      const uploadOptions = {
        resource_type: resourceType,
        folder: isVideo ? 'ourmoments/videos' : 'ourmoments/images'
      };

      if (!isVideo) {
        uploadOptions.quality = 'auto:best';
        uploadOptions.fetch_format = 'auto';
        uploadOptions.flags = 'progressive'; 
    
      } else {
        uploadOptions.quality = 'auto:best';
        uploadOptions.resource_type = 'video';
      }

      const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

      const media = await Media.create({
        url: result.secure_url,
        type: isVideo ? 'video' : 'image',
        publicId: result.public_id,
        thumbnail: isVideo ? result.secure_url.replace(/\.[^.]+$/, '.jpg') : null
      });

      logger.info(`Media uploaded successfully: ${media._id} to ${isVideo ? 'video' : 'image'} cloudinary`);
      return media;
    } catch (error) {
      logger.error('Upload media error:', error);
      throw error;
    }
  }

  async getAllMedia(type = null, page = 1, limit = 20) {
    try {
      const query = type ? { type } : {};
      const skip = (page - 1) * limit;

      const [media, total] = await Promise.all([
        Media.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Media.countDocuments(query)
      ]);

      return {
        media,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
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

      // Chọn Cloudinary instance phù hợp để xóa
      const cloudinary = media.type === 'video' ? cloudinaryVideo : cloudinaryImage;

      await cloudinary.uploader.destroy(media.publicId, {
        resource_type: media.type === 'video' ? 'video' : 'image'
      });

      await FavoriteMedia.deleteOne({ mediaId: id });
      await Media.findByIdAndDelete(id);

      logger.info(`Media deleted successfully from ${media.type} cloudinary: ${id}`);
      return { message: 'Xóa media thành công' };
    } catch (error) {
      logger.error('Delete media error:', error);
      throw error;
    }
  }
}

module.exports = new MediaService();