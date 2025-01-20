const { verifyToken } = require('../helper/jwt');
const { User } = require('../models');

const authentication = async (req, res, next) => {
  try {
    let { access_token } = req.headers;
    if (!access_token) {
      throw { name: 'NoToken' };
    }
    let payload = verifyToken(access_token);
    // console.log(payload);
    let user = await User.findByPk(payload.id);
    if (!user) {
      throw { name: 'Forbidden' };
    }
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    console.log(req.user);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authentication;
