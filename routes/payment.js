const PaymentController = require('../controllers/PaymentController');

const router = require('express').Router();

router.put('/:userId', PaymentController.updateStatusPayment);
router.post('/upload-payment', PaymentController.uploadPaymentProof);
router.get('/get-payment/:id', PaymentController.getPaymentProof);

module.exports = router;

// const PaymentController = require('../controllers/PaymentController');
// const { route } = require('./user');

// const router = require('express').Router();

// router.put('/:userId', PaymentController.updateStatusPayment);
// router.post('/upload-payment', PaymentController.uploadPaymentProof);
// router.get('/get-payment/:id', PaymentController.getPaymentProofAsBase64);
// router.post('/token-google', PaymentController.generateTokenService);
// router.get('/setcode', PaymentController.setCode);

// router.post('/upload-google', PaymentController.uploadToGoogleDrive);
// module.exports = router;
