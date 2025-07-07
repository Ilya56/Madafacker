'use strict';

/**
 * Adds a unique field authProviderId to the user model with type string
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('UserModels', 'authProviderId', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
      defaultValue: 'no-provided-id',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('UserModels', 'authProviderId');
  },
};
