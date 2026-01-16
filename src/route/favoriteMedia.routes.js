const express = require('express');
const router = express.Router();
const favoriteMediaController = require('../controllers/favoriteMedia.controller');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/', asyncHandler(favoriteMediaController.addFavorite));

router.get('/', asyncHandler(favoriteMediaController.getAllFavorites));

router.get('/:id', asyncHandler(favoriteMediaController.getFavoriteById));

router.get('/check/:mediaId', asyncHandler(favoriteMediaController.checkIsFavorite));

router.delete('/:id', asyncHandler(favoriteMediaController.removeFavorite));

router.delete('/media/:mediaId', asyncHandler(favoriteMediaController.removeFavoriteByMediaId));

module.exports = router;