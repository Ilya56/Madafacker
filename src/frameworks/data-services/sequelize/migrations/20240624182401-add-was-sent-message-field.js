'use strict';

/**
 * Adds a field wasSent to the message model with type boolean and default value false
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('MessageModels', 'wasSent', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('MessageModels', 'wasSent');
  },
};
