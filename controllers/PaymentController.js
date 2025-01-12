const path = require('path');
const multer = require('multer');
const { User, PaymentStatus } = require('../models'); // Import model Sequelize

// Setup multer untuk upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder penyimpanan file
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Format nama file
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Maksimal ukuran file 10 MB
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
}).single('paymentProof'); // "paymentProof" harus sesuai dengan nama field di form

// Controller untuk handle upload
const uploadPaymentProof = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { userId, paymentPeriod } = req.body; // Ambil data dari body request
      // Validasi user
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User tidak ditemukan' });
      }

      // Simpan data ke database
      const payment = await PaymentStatus.create({
        paymentPeriod,
        uploadDate: new Date(),
        amount: null, // Opsional, bisa diisi dari frontend jika diperlukan
        paymentStatus: 'Pending', // Default status pembayaran
        userId: user.id,
        proofPath: `/uploads/${req.file.filename}`, // Path file yang diunggah
      });

      res.status(201).json({
        message: 'Bukti pembayaran berhasil diunggah',
        data: payment,
      });
    } catch (error) {
      res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
  });
};

module.exports = { uploadPaymentProof };
