'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('PaymentStatuses', 'fileData'); // Remove fileData column
    await queryInterface.addColumn('PaymentStatuses', 'fileId', {
      type: Sequelize.STRING,
      allowNull: true, // Allow null if necessary
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('PaymentStatuses', 'fileId'); // Rollback fileId column
    await queryInterface.addColumn('PaymentStatuses', 'fileData', {
      type: Sequelize.BLOB('long'),
      allowNull: true, // Restore the previous field
    });
  },
};
