const router = require('express').Router();
const authentication = require('../middleware/authentication');
const userRouter = require('./user');
const paymentRouter = require('./payment');

router.use('/user', userRouter);
router.use('/payment', paymentRouter);

//authentication
// router.use(authentication);

module.exports = router;
