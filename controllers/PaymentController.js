const path = require('path');
const multer = require('multer');
const { User, PaymentStatus } = require('../models');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf/;
    const extName = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file JPG, PNG, atau PDF yang diperbolehkan'));
    }
  },
}).single('paymentProof');

const uploadPaymentProof = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { userId, paymentPeriod } = req.body;
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User tidak ditemukan' });
      }
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'Payment proof file is required.' });
      }

      const payment = await PaymentStatus.create({
        paymentPeriod: paymentPeriod,
        uploadDate: new Date(),
        amount: 150000,
        paymentStatus: 'Pending',
        userId: user.id,
        fileData: req.file.buffer,
      });
      res.status(201).json({
        message: 'Bukti pembayaran berhasil diunggah',
        data: {
          paymentPeriod: payment.paymentPeriod,
          userId: payment.userId,
          amount: payment.amount,
          paymentStatus: payment.PaymentStatus,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
  });
};

const getPaymentProofAsBase64 = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await PaymentStatus.findByPk(id);

    if (!payment || !payment.fileData) {
      return res.status(404).json({ error: 'Payment proof not found.' });
    }

    const base64File = payment.fileData.toString('base64');

    const mimeType = payment.mimeType || 'application/octet-stream';

    res.status(200).json({
      message: 'Success Get Payment',
      data: {
        mimeType,
        base64: base64File,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateStatusPayment = async (req, res, next) => {
  try {
    const { userId } = req.params;
    let { paymentStatus } = req.body;

    const user = await User.findByPk(+userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    await PaymentStatus.update(
      {
        paymentStatus: paymentStatus,
      },
      { where: { userId }, individualHooks: true }
    );
    findUser = await User.findByPk(+userId, {
      attributes: { exclude: ['createdAt', 'updatedAt', 'password'] },
    });

    res.status(200).json({
      message: `Successfully updated user ${findUser.fullName}`,
    });
    // Response data
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadPaymentProof,
  updateStatusPayment,
  getPaymentProofAsBase64,
};
