'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'isActive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Ensure consistency with the model
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'isActive');
  },
};
