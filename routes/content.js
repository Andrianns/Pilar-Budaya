const ContentController = require('../controllers/ContentController');

const router = require('express').Router();

router.post('/postContent', ContentController.postContent);
router.get('/gallery', ContentController.getContentGallery);
router.get('/pelatih', ContentController.getContentPelatih);
router.get('/allContent', ContentController.getAllContent);

module.exports = router;
