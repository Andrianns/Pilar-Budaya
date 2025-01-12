'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PaymentStatus.init({
    userId: DataTypes.INTEGER,
    paymentPeriod: DataTypes.STRING,
    uploadDate: DataTypes.DATE,
    amount: DataTypes.INTEGER,
    paymentStatus: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PaymentStatus',
  });
  return PaymentStatus;
};