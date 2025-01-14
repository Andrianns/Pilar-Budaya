const UserController = require('../controllers/UserController');

const router = require('express').Router();

router.post('/login', UserController.login);
router.post('/register', UserController.register);
router.get('/', UserController.getAllUserCustomer);
router.get('/:userId', UserController.getUserById);
module.exports = router;
