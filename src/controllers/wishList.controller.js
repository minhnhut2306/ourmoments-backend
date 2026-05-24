const wishListService = require('../services/wishList.service');
const {
  successResponse,
  createdResponse,
  badRequestResponse
} = require('../helper/createResponse.helper');

class WishListController {
  async getAll(req, res) {
    const items = await wishListService.getAll();
    return res.status(200).json(successResponse('Lấy danh sách thành công', { items }));
  }

  async create(req, res) {
    const item = await wishListService.create(req.body);
    return res.status(201).json(createdResponse('Thêm sản phẩm thành công', item));
  }

  async update(req, res) {
    const item = await wishListService.update(req.params.id, req.body);
    return res.status(200).json(successResponse('Cập nhật thành công', item));
  }

  async markPurchased(req, res) {
    const { purchased } = req.body;
    const item = await wishListService.markPurchased(req.params.id, purchased);
    return res.status(200).json(successResponse('Cập nhật trạng thái thành công', item));
  }

  async delete(req, res) {
    const result = await wishListService.delete(req.params.id);
    return res.status(200).json(successResponse(result.message));
  }

  async analyzeByImage(req, res) {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json(badRequestResponse('Thiếu imageUrl'));
    }
    const result = await wishListService.analyzeByImage(imageUrl);
    return res.status(200).json(successResponse('Phân tích ảnh thành công', result));
  }

  async analyzeByUrl(req, res) {
    const { shopeeUrl } = req.body;
    if (!shopeeUrl) {
      return res.status(400).json(badRequestResponse('Thiếu shopeeUrl'));
    }
    const result = await wishListService.analyzeByUrl(shopeeUrl);
    return res.status(200).json(successResponse('Phân tích URL thành công', result));
  }
}

module.exports = new WishListController();
