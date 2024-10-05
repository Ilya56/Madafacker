'use strict';
/**
 * Creates message model table
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MessageModels', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      body: {
        allowNull: false,
        type: Sequelize.STRING(1000),
      },
      authorId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: { model: 'UserModels', key: 'id' },
      },
      mode: {
        allowNull: false,
        type: Sequelize.ENUM('light', 'dark'),
      },
      parentId: {
        type: Sequelize.UUID,
        references: { model: 'MessageModels', key: 'id' },
      },
      public: {
        defaultValue: true,
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('MessageModels');
  },
};
