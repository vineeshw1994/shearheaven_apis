'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('otps', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      otpHash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      attempts: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      clientId: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: '',
      },
      regionId: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: '',
      },
      storeId: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: '',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('otps', ['email']);
    await queryInterface.addIndex('otps', ['expiresAt']);
    await queryInterface.addIndex('otps', ['clientId', 'regionId', 'storeId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('otps');
  },
};
