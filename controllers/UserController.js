const { User, PaymentStatus } = require('../models');
const { compareHash } = require('../helper/bcrypt');
const { createToken } = require('../helper/jwt');
const paymentstatus = require('../models/paymentstatus');
const { where } = require('sequelize');
class UserController {
  static async register(req, res, next) {
    const { fullName, username, email, phoneNumber, birthDate, password } =
      req.body;
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
        email,
        username,
      });
    } catch (error) {
      console.log(error, '<<<<<from controller error');
      next(error);
    }
  }

  static async getAllUserCustomer(req, res, next) {
    try {
      const user = await User.findAll({
        attributes: {
          exclude: ['password', 'createdAt', 'updatedAt'],
        },
        where: {
          role: 'Customer',
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

      // Query User dengan relasi ke PaymentStatus
      const user = await User.findByPk(userId, {
        include: {
          model: PaymentStatus,
          attributes: { exclude: ['fileData'] }, // Mengecualikan kolom fileData
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
