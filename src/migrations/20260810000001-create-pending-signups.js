'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('pending_signups')) {
      return;
    }

    await queryInterface.createTable('pending_signups', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      mobile: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      password: {
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

    await queryInterface.addIndex('pending_signups', ['email']);
    await queryInterface.addIndex('pending_signups', ['mobile']);
    await queryInterface.addIndex('pending_signups', ['expiresAt']);
    await queryInterface.addIndex('pending_signups', ['clientId', 'regionId', 'storeId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('pending_signups');
  },
};
