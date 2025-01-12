const PaymentController = require('../controllers/PaymentController');
const { route } = require('./user');

const router = require('express').Router();

router.put('/:userId', PaymentController.updateStatusPayment);
router.post('/upload-payment', PaymentController.uploadPaymentProof);
router.get('/get-payment/:id', PaymentController.getPaymentProofAsBase64);
module.exports = router;
