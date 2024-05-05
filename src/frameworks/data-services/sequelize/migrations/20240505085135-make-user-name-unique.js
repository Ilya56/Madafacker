'use strict';

const TABLE_NAME = 'UserModels';
const FIELD_NAME = 'name';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(TABLE_NAME, FIELD_NAME, {
      unique: true,
      allowNull: false,
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(TABLE_NAME, FIELD_NAME, {
      unique: false,
      allowNull: false,
      type: Sequelize.STRING,
    });
  },
};
