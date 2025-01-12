const router = require('express').Router();
const authentication = require('../middleware/authentication');
const userRouter = require('./user');
const { uploadPaymentProof } = require('../controllers/PaymentController');

router.post('/upload-payment', uploadPaymentProof);
router.use('/user', userRouter);

//authentication
router.use(authentication);

module.exports = router;
