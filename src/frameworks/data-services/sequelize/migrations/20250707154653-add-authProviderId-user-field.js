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
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE "UserModels"
      SET "authProviderId" = gen_random_uuid()
      WHERE "authProviderId" IS NULL;
    `);

    await queryInterface.changeColumn('UserModels', 'authProviderId', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('UserModels', 'authProviderId');
  },
};
