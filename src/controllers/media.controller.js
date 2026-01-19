const mediaService = require('../services/media.service');
const {
  successResponse,
  createdResponse
} = require('../helper/createResponse.helper');

class MediaController {
  async saveMediaMetadata(req, res) {
    const media = await mediaService.saveMediaMetadata(req.body);
    return res.status(201).json(
      createdResponse('Lưu metadata thành công', media)
    );
  }

  async getAllMedia(req, res) {
    const { type, page = 1, limit = 20 } = req.query;
    const result = await mediaService.getAllMedia(type, page, limit);
    return res.status(200).json(
      successResponse('Lấy danh sách media thành công', result)
    );
  }

  async getMediaById(req, res) {
    const media = await mediaService.getMediaById(req.params.id);
    return res.status(200).json(
      successResponse('Lấy thông tin media thành công', media)
    );
  }

  async getImageMedia(req, res) {
    const { page = 1, limit = 20 } = req.query;
    const result = await mediaService.getImageMedia(page, limit);
    return res.status(200).json(
      successResponse('Lấy danh sách ảnh thành công', result)
    );
  }

  async getVideoMedia(req, res) {
    const { page = 1, limit = 20 } = req.query;
    const result = await mediaService.getVideoMedia(page, limit);
    return res.status(200).json(
      successResponse('Lấy danh sách video thành công', result)
    );
  }

  async updateMedia(req, res) {
    const media = await mediaService.updateMedia(req.params.id, req.body);
    return res.status(200).json(
      successResponse('Cập nhật media thành công', media)
    );
  }

  async deleteMedia(req, res) {
    const result = await mediaService.deleteMedia(req.params.id);
    return res.status(200).json(
      successResponse(result.message)
    );
  }
}

module.exports = new MediaController();