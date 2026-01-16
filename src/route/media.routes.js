const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
const upload = require('../config/multer');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/upload', upload.single('file'), asyncHandler(mediaController.uploadMedia));

router.get('/', asyncHandler(mediaController.getAllMedia));

router.get('/images', asyncHandler(mediaController.getImageMedia));

router.get('/videos', asyncHandler(mediaController.getVideoMedia));

router.get('/:id', asyncHandler(mediaController.getMediaById));

router.put('/:id', asyncHandler(mediaController.updateMedia));

router.delete('/:id', asyncHandler(mediaController.deleteMedia));

module.exports = router;