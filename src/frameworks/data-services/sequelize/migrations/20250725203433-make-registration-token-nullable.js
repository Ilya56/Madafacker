'use strict';

const TABLE_NAME = 'UserModels';
const FIELD_NAME = 'registrationToken';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(TABLE_NAME, FIELD_NAME, {
      type: Sequelize.STRING(1000),
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(TABLE_NAME, FIELD_NAME, {
      type: Sequelize.STRING(1000),
      allowNull: false,
      unique: true,
    });
  },
};
