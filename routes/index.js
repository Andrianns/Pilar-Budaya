const router = require('express').Router();
const authentication = require('../middleware/authentication');
const userRouter = require('./user');
const paymentRouter = require('./payment');
const contentRouter = require('./content');

router.use('/user', userRouter);
router.use('/content', contentRouter);
router.use('/payment', authentication, paymentRouter);

//authentication

module.exports = router;
