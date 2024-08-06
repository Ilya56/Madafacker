'use strict';

/**
 * Adds a field rating to the income user message model with type string and default value null
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('IncomeUserMessagesModels', 'rating', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('IncomeUserMessagesModels', 'rating');
  },
};
