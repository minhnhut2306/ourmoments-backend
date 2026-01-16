const favoriteMediaService = require('../services/favoriteMedia.service');
const {
  successResponse,
  createdResponse
} = require('../helper/createResponse.helper');

class FavoriteMediaController {
  async addFavorite(req, res) {
    const { mediaId } = req.body;
    const favorite = await favoriteMediaService.addFavorite(mediaId);
    return res.status(201).json(
      createdResponse('Thêm vào yêu thích thành công', favorite)
    );
  }

  async getAllFavorites(req, res) {
    const { page = 1, limit = 20 } = req.query;
    const result = await favoriteMediaService.getAllFavorites(page, limit);
    return res.status(200).json(
      successResponse('Lấy danh sách yêu thích thành công', result)
    );
  }

  async getFavoriteById(req, res) {
    const favorite = await favoriteMediaService.getFavoriteById(req.params.id);
    return res.status(200).json(
      successResponse('Lấy thông tin yêu thích thành công', favorite)
    );
  }

  async removeFavorite(req, res) {
    const result = await favoriteMediaService.removeFavorite(req.params.id);
    return res.status(200).json(
      successResponse(result.message)
    );
  }

  async removeFavoriteByMediaId(req, res) {
    const result = await favoriteMediaService.removeFavoriteByMediaId(req.params.mediaId);
    return res.status(200).json(
      successResponse(result.message)
    );
  }

  async checkIsFavorite(req, res) {
    const result = await favoriteMediaService.checkIsFavorite(req.params.mediaId);
    return res.status(200).json(
      successResponse('Kiểm tra trạng thái yêu thích thành công', result)
    );
  }
}

module.exports = new FavoriteMediaController();