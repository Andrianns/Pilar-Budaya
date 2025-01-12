const { User } = require('../models');
const { compareHash } = require('../helper/bcrypt');
const { createToken } = require('../helper/jwt');
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
  static;
}
module.exports = UserController;
