'use strict';

/**
 * Adds a field coins to the user model with type number and default value 0
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Install the UUID extension to this database
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryInterface.addColumn('UserModels', 'registrationToken', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE "UserModels" SET "registrationToken" = uuid_generate_v4() WHERE "registrationToken" IS NULL;
    `);

    await queryInterface.changeColumn('UserModels', 'registrationToken', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('UserModels', 'registrationToken');
  },
};
