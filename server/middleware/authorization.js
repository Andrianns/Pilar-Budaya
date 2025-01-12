const { Favourite } = require('../models');
const authorization = async (req, res, next) => {
  try {
    let favourite = Favourite.findByPk(req.params.id);
    if (!favourite) {
      throw { name: 'NotFound' };
    }
    if (req.user.id === favourite.UserId) {
      next();
    } else {
      throw { name: 'Forbidden' };
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = authorization;
