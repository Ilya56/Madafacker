'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v4: uuid } = require('uuid');

const LENGTH = 100;

let bytes = [0x10, 0x91, 0x56, 0xbe, 0xc4, 0xfb, 0xc1, 0xea, 0x71, 0xb4, 0xef, 0xe1, 0x67, 0x1c, 0x58];
let lastByte = 0x00;

/**
 * Creates a preset UUID
 * @param {number} i uuid offset. By the fact last number of the uuid
 * @return {`${string}-${string}-${string}-${string}-${string}`}
 */
function getUuid(i) {
  const random = [...bytes, lastByte + i];
  return uuid({ random });
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const bulkCreate = new Array(LENGTH).fill(null).map((_, i) => ({
      id: getUuid(i),
      name: `Test User #${i}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await queryInterface.bulkInsert('UserModels', bulkCreate);
  },

  async down(queryInterface) {
    const deleteIds = new Array(LENGTH).fill(0).map((_, i) => getUuid(i));
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete('UserModels', { id: deleteIds }, { transaction });
      await queryInterface.bulkDelete('IncomeUserMessagesModels', { userId: deleteIds }, { transaction });
      await queryInterface.bulkDelete('MessageModels', { authorId: deleteIds }, { transaction });
    });
  },
};
