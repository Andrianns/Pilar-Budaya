const ContentController = require('../controllers/ContentController');
const authentication = require('../middleware/authentication');

const router = require('express').Router();

router.get('/gallery', ContentController.getContentGallery);
router.get('/pelatih', ContentController.getContentPelatih);
router.use(authentication);
router.post('/postContent', ContentController.postContent);
router.get('/allContent', ContentController.getAllContent);
router.put('/updateContent/:id', ContentController.updateContent);
router.delete('/deleteContent/:id', ContentController.deleteContent);
module.exports = router;
