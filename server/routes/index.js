const router = require('express').Router();
const authentication = require('../middleware/authentication');
const userRouter = require('./user');

router.use('/user', userRouter);

//authentication
router.use(authentication);

module.exports = router;
