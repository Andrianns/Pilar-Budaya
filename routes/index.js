const router = require('express').Router();
const authentication = require('../middleware/authentication');
const userRouter = require('./user');
const paymentRouter = require('./payment');
const contentRouter = require('./content');

router.use('/user', userRouter);
router.use(authentication);
router.use('/payment', paymentRouter);
router.use('/content', contentRouter);

//authentication

module.exports = router;
