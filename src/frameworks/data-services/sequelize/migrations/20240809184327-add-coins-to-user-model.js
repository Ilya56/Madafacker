'use strict';

/**
 * Adds a field coins to the user model with type number and default value 0
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('UserModels', 'coins', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('UserModels', 'coins');
  },
};
