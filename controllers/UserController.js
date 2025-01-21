const { User, PaymentStatus } = require('../models');
const { compareHash } = require('../helper/bcrypt');
const { createToken } = require('../helper/jwt');
const { google } = require('googleapis');
const { shareFile } = require('../helper/util');
const upload = require('../helper/upload');
const {
  authenticateGoogle,
  bufferToStream,
  ensureParentFolderExists,
} = require('../helper/googleAuth');
class UserController {
  static async register(req, res, next) {
    upload(req, res, async (err) => {
      const {
        fullName,
        username,
        email,
        phoneNumber,
        birthDate,
        password,
        paymentPeriod,
      } = req.body;
      try {
        const formattedBirthDate = new Date(birthDate);
        if (isNaN(formattedBirthDate)) {
          throw {
            status: 400,
            message: 'Invalid birthDate format. Use YYYY-MM-DD.',
          };
        }
        let data = await User.create({
          fullName,
          username,
          email,
          phoneNumber,
          birthDate,
          password,
          role: 'Customer',
        });
        const { role } = data;
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
          return res.status(500).json({
            error: 'Failed to find or create folder on Google Drive.',
          });
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

        const payment = await PaymentStatus.create({
          paymentPeriod,
          uploadDate: new Date(),
          amount: 150000,
          paymentStatus: 'Pending',
          userId: data.id,
          fileId: response.data.id,
          fileUrl: imgUrl,
          proofPath: 'pendaftaran',
        });

        if (!payment) {
          throw new Error('Failed to save payment record in the database.');
        }

        res.status(201).json({
          message: 'success register customer',
          data: {
            username,
            email,
            phoneNumber,
            role,
          },
        });
      } catch (error) {
        console.log(error);
        next(error);
      }
    });
  }

  static async login(req, res, next) {
    const { email, password } = req.body;
    try {
      let findUser = await User.findOne({
        where: {
          email: email,
        },
      });
      if (!findUser) {
        throw { name: 'Invalid email/password' };
      }
      if (findUser.isActive === false) {
        throw { name: 'Your account is not active' };
      }
      const comparePassword = compareHash(password, findUser.password);
      if (!comparePassword) {
        throw { name: 'Invalid email/password' };
      }
      const payload = {
        id: findUser.id,
        username: findUser.username,
      };
      const access_token = createToken(payload);
      let username = findUser.username;
      res.status(200).json({
        access_token: access_token,
        id: findUser.id,
        email,
        username,
        role: findUser.role,
      });
    } catch (error) {
      console.log(error, '<<<<<from controller error');
      next(error);
    }
  }

  static async getAllUserCustomer(req, res, next) {
    try {
      let { index, limit } = req.body;
      const totalItems = await User.count({
        where: {
          role: 'Customer',
        },
      });
      index = parseInt(index) || 1;
      limit = parseInt(limit) || totalItems;

      // Hitung offset berdasarkan index dan limit
      const offset = (index - 1) * limit;

      const user = await User.findAll({
        attributes: {
          exclude: ['password', 'createdAt', 'updatedAt'],
        },
        where: {
          role: 'Customer',
        },
        limit, // Tetapkan limit untuk membatasi jumlah data
        offset,
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      res.status(200).json({
        message: 'Success',
        total: totalItems,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
  static async getAllUserAdmin(req, res, next) {
    try {
      const user = await User.findAll({
        attributes: {
          exclude: ['password', 'createdAt', 'updatedAt'],
        },
        where: {
          role: 'Admin',
        },
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      res.status(200).json({
        message: 'Success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const { userId } = req.params; // Ambil userId dari parameter request
      const { paymentType } = req.body;
      // Query User dengan relasi ke PaymentStatus
      const user = await User.findByPk(userId, {
        include: {
          model: PaymentStatus,
          attributes: { exclude: ['fileData', 'createdAt', 'updatedAt'] },
          where: {
            paymentType,
          },
        },
      });
      // Jika user tidak ditemukan
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      // Response data
      res.status(200).json({
        message: 'Success',
        data: {
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          birthDate: user.birthDate,
          payments: user.PaymentStatuses, // Relasi dengan PaymentStatus
        },
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}
module.exports = UserController;
