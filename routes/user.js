const UserController = require('../controllers/UserController');

const router = require('express').Router();

router.post('/login', UserController.login);
router.post('/register', UserController.register);

module.exports = router;
