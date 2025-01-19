'use strict';
const { Model } = require('sequelize');
const { hashPassword } = require('../helper/bcrypt');
const { HTMLDateFormat } = require('../helper/dateFormat.js');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.PaymentStatus, { foreignKey: 'userId' });
    }
  }
  User.init(
    {
      fullName: DataTypes.STRING,
      username: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'This email is already exists',
        },
        validate: {
          notNull: {
            msg: 'Email cannot be empty.',
          },
          notEmpty: {
            msg: 'Email cannot be empty.',
          },
        },
      },
      phoneNumber: DataTypes.STRING,
      birthDate: DataTypes.DATE,
      password: DataTypes.STRING,
      role: DataTypes.STRING,
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Set a default value
        allowNull: false,
      },
    },

    {
      hooks: {
        beforeCreate(instance, options) {
          instance.password = hashPassword(instance.password);
        },
        beforeUpdate(instance, options) {
          instance.password = hashPassword(instance.password);
        },
      },
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
