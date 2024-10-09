'use strict';

/**
 * Adds a field tokenIsInvalid to the user model with type boolean and default value false
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('UserModels', 'tokenIsInvalid', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('UserModels', 'tokenIsInvalid');
  },
};
