const { User, PaymentStatus } = require('../models');
const { google } = require('googleapis');
const upload = require('../helper/upload');
const { shareFile } = require('../helper/util');
const {
  authenticateGoogle,
  bufferToStream,
  ensureParentFolderExists,
} = require('../helper/googleAuth');

const uploadPaymentProof = async (req, res, next) => {
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

      const drive = google.drive({
        version: 'v3',
        auth: await authenticateGoogle(),
      });

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const folderName = 'Bukti Pembayaran';
      const folderId = await ensureParentFolderExists(drive, folderName);

      const fileMetadata = {
        name: req.file.originalname,
        parents: [folderId],
      };

      const media = {
        mimeType: req.file.mimetype,
        body: bufferToStream(req.file.buffer),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id',
      });
      imgUrl = await shareFile(drive, response.data.id);
      const payment = await PaymentStatus.create({
        paymentPeriod: paymentPeriod,
        uploadDate: new Date(),
        amount: 150000,
        paymentStatus: 'Pending',
        userId: user.id,
        fileId: response.data.id,
        fileUrl: imgUrl,
      });
      res.status(201).json({
        message: 'Bukti pembayaran berhasil diunggah',
        data: {
          paymentPeriod: payment.paymentPeriod,
          userId: payment.userId,
          amount: payment.amount,
          paymentStatus: payment.PaymentStatus,
          imageUrl: payment.fileUrl,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  });
};

const getPaymentProof = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await PaymentStatus.findByPk(id);

    if (!payment || !payment.fileUrl) {
      return res
        .status(404)
        .json({ error: 'Bukti Pembayaran Tidak Ditemukan' });
    }

    res.status(200).json({
      message: 'Success Get Payment',
      data: {
        imageUrl: payment.fileUrl,
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
  getPaymentProof,
};
