'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const tableSet = new Set(tables.map((name) => String(name).toLowerCase()));

    if (!tableSet.has('client_master')) {
      await queryInterface.createTable('client_master', {
        id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        clientId: { type: Sequelize.STRING(50), allowNull: false, unique: true },
        name: { type: Sequelize.STRING(150), allowNull: false },
        isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
    }

    if (!tableSet.has('region_master')) {
      await queryInterface.createTable('region_master', {
        id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        regionId: { type: Sequelize.STRING(50), allowNull: false },
        clientId: { type: Sequelize.STRING(50), allowNull: false },
        name: { type: Sequelize.STRING(150), allowNull: false },
        isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
      await queryInterface.addIndex('region_master', ['clientId', 'regionId'], {
        unique: true,
        name: 'region_master_client_region_unique',
      });
    }

    if (!tableSet.has('store_master')) {
      await queryInterface.createTable('store_master', {
        id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        storeId: { type: Sequelize.STRING(50), allowNull: false },
        clientId: { type: Sequelize.STRING(50), allowNull: false },
        regionId: { type: Sequelize.STRING(50), allowNull: false },
        name: { type: Sequelize.STRING(150), allowNull: false },
        isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
      await queryInterface.addIndex('store_master', ['storeId', 'clientId', 'regionId'], {
        unique: true,
        name: 'store_master_store_tenant_unique',
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('store_master');
    await queryInterface.dropTable('region_master');
    await queryInterface.dropTable('client_master');
  },
};
