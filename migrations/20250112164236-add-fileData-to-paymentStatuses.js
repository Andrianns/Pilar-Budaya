'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('PaymentStatuses', 'fileData', {
      type: Sequelize.BLOB('long'), // Gunakan 'medium' atau 'long' sesuai kebutuhan
      allowNull: true, // File opsional
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('PaymentStatuses', 'fileData');
  },
};
