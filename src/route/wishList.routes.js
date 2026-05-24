const express = require('express');
const router = express.Router();
const wishListController = require('../controllers/wishList.controller');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(wishListController.getAll));
router.post('/', asyncHandler(wishListController.create));
router.put('/:id', asyncHandler(wishListController.update));
router.patch('/:id/purchased', asyncHandler(wishListController.markPurchased));
router.delete('/:id', asyncHandler(wishListController.delete));

router.post('/analyze/image', asyncHandler(wishListController.analyzeByImage));
router.post('/analyze/url', asyncHandler(wishListController.analyzeByUrl));

module.exports = router;
