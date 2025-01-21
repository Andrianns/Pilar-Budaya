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
      return res.status(400).json({ error: `Upload Error: ${err.message}` });
    }

    try {
      const { userId, paymentPeriod } = req.body;

      // Validate input
      if (!userId || !paymentPeriod) {
        return res
          .status(400)
          .json({ error: 'User ID and payment period are required.' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      // Ensure a file is uploaded
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'No file uploaded. Please provide a file.' });
      }

      const drive = google.drive({
        version: 'v3',
        auth: await authenticateGoogle(),
      });

      if (!drive) {
        return res
          .status(500)
          .json({ error: 'Google Drive authentication failed.' });
      }

      // Ensure the folder exists on Google Drive
      const folderName = 'Bukti Pembayaran';
      const folderId = await ensureParentFolderExists(drive, folderName);
      if (!folderId) {
        return res
          .status(500)
          .json({ error: 'Failed to find or create folder on Google Drive.' });
      }

      // Set metadata and file upload properties
      const fileMetadata = {
        name: req.file.originalname,
        parents: [folderId],
      };

      const media = {
        mimeType: req.file.mimetype,
        body: bufferToStream(req.file.buffer),
      };

      if (!media) {
        return res
          .status(500)
          .json({ error: 'Failed to convert buffer to stream.' });
      }

      // Upload the file to Google Drive
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id',
      });

      if (!response || !response.data || !response.data.id) {
        throw new Error('Failed to upload file to Google Drive.');
      }

      // Share file and get the file URL
      const imgUrl = await shareFile(drive, response.data.id);
      if (!imgUrl) {
        throw new Error('Failed to generate shareable file URL.');
      }

      // Create payment status entry in the database
      const payment = await PaymentStatus.create({
        paymentPeriod,
        uploadDate: new Date(),
        amount: 100000,
        paymentStatus: 'Pending',
        userId: user.id,
        fileId: response.data.id,
        fileUrl: imgUrl,
        proofPath: 'iuran',
      });

      if (!payment) {
        throw new Error('Failed to save payment record in the database.');
      }

      // Respond with success
      res.status(201).json({
        message: 'Bukti pembayaran berhasil diunggah.',
        data: {
          paymentPeriod: payment.paymentPeriod,
          userId: payment.userId,
          amount: payment.amount,
          paymentStatus: payment.paymentStatus,
          imageUrl: payment.fileUrl,
          uploadDate: payment.createdAt,
        },
      });
    } catch (error) {
      // Handle specific error messages if needed
      if (error.message.includes('Failed to')) {
        return res.status(500).json({ error: error.message });
      }
      // Default error response
      return res.status(500).json({
        error: error.message,
      });
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
    let { paymentStatus, paymentId } = req.body;

    const user = await User.findByPk(+userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updateOptions = {
      where: { userId },
      individualHooks: true,
    };

    // Tambahkan kondisi `paymentId` jika tersedia
    if (paymentId) {
      updateOptions.where.id = paymentId;
    }

    // Update PaymentStatus (hanya jika paymentId tersedia)
    await PaymentStatus.update(
      {
        paymentStatus: paymentStatus,
      },
      updateOptions
    );
    await User.update(
      {
        paymentStatus: paymentStatus,
        isActive: true,
      },
      { where: { id: userId } }
    );

    findUser = await User.findByPk(+userId, {
      attributes: { exclude: ['createdAt', 'updatedAt', 'password'] },
    });

    res.status(200).json({
      message: `Successfully updated user ${findUser.fullName}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadPaymentProof,
  updateStatusPayment,
  getPaymentProof,
};
