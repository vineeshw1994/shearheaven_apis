'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const tableSet = new Set(tables.map((name) => String(name).toLowerCase()));

    if (!tableSet.has('groomers')) {
      await queryInterface.createTable('groomers', {
        id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        groomerCode: { type: Sequelize.STRING(50), allowNull: false },
        firstName: { type: Sequelize.STRING(100), allowNull: false },
        lastName: { type: Sequelize.STRING(100), allowNull: false },
        role: { type: Sequelize.STRING(100), allowNull: false, defaultValue: '' },
        highlights: { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
        type: { type: Sequelize.ENUM('Groomer', 'Bather'), allowNull: false, defaultValue: 'Groomer' },
        isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        clientId: { type: Sequelize.STRING(50), allowNull: false },
        regionId: { type: Sequelize.STRING(50), allowNull: false },
        storeId: { type: Sequelize.STRING(50), allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
      await queryInterface.addIndex('groomers', ['groomerCode', 'clientId', 'regionId', 'storeId'], {
        unique: true,
        name: 'groomers_code_tenant_unique',
      });
      await queryInterface.addIndex('groomers', ['clientId', 'regionId', 'storeId']);
    }

    if (!tableSet.has('holiday_list')) {
      await queryInterface.createTable('holiday_list', {
        id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        holidayCode: { type: Sequelize.STRING(50), allowNull: false },
        name: { type: Sequelize.STRING(150), allowNull: false },
        date: { type: Sequelize.DATEONLY, allowNull: false },
        description: { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
        isStoreSpecific: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        clientId: { type: Sequelize.STRING(50), allowNull: false },
        regionId: { type: Sequelize.STRING(50), allowNull: false },
        storeId: { type: Sequelize.STRING(50), allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
      await queryInterface.addIndex('holiday_list', ['date']);
      await queryInterface.addIndex('holiday_list', ['clientId', 'regionId', 'storeId']);
    }

    if (!tableSet.has('store_operational_hours')) {
      await queryInterface.createTable('store_operational_hours', {
        id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        dayOfWeek: { type: Sequelize.STRING(20), allowNull: false },
        isOpen: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        startTime: { type: Sequelize.STRING(5), allowNull: false, defaultValue: '' },
        endTime: { type: Sequelize.STRING(5), allowNull: false, defaultValue: '' },
        clientId: { type: Sequelize.STRING(50), allowNull: false },
        regionId: { type: Sequelize.STRING(50), allowNull: false },
        storeId: { type: Sequelize.STRING(50), allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
      await queryInterface.addIndex(
        'store_operational_hours',
        ['dayOfWeek', 'clientId', 'regionId', 'storeId'],
        { unique: true, name: 'store_hours_day_tenant_unique' }
      );
    }

    if (!tableSet.has('groomer_working_hours')) {
      await queryInterface.createTable('groomer_working_hours', {
        id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        groomerId: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: { model: 'groomers', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        dayOfWeek: { type: Sequelize.STRING(20), allowNull: false },
        isWorking: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        startTime: { type: Sequelize.STRING(5), allowNull: false, defaultValue: '' },
        endTime: { type: Sequelize.STRING(5), allowNull: false, defaultValue: '' },
        clientId: { type: Sequelize.STRING(50), allowNull: false },
        regionId: { type: Sequelize.STRING(50), allowNull: false },
        storeId: { type: Sequelize.STRING(50), allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
      await queryInterface.addIndex('groomer_working_hours', ['groomerId', 'dayOfWeek'], {
        unique: true,
        name: 'groomer_hours_day_unique',
      });
      await queryInterface.addIndex('groomer_working_hours', ['clientId', 'regionId', 'storeId']);
    }

    if (!tableSet.has('groomer_unavailability')) {
      await queryInterface.createTable('groomer_unavailability', {
        id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        groomerId: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: { model: 'groomers', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        startDate: { type: Sequelize.DATEONLY, allowNull: false },
        endDate: { type: Sequelize.DATEONLY, allowNull: false },
        startTime: { type: Sequelize.STRING(5), allowNull: false, defaultValue: '' },
        endTime: { type: Sequelize.STRING(5), allowNull: false, defaultValue: '' },
        reason: { type: Sequelize.STRING(255), allowNull: false, defaultValue: '' },
        leaveType: {
          type: Sequelize.ENUM('leave', 'break', 'unavailable', 'other'),
          allowNull: false,
          defaultValue: 'unavailable',
        },
        clientId: { type: Sequelize.STRING(50), allowNull: false },
        regionId: { type: Sequelize.STRING(50), allowNull: false },
        storeId: { type: Sequelize.STRING(50), allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
      await queryInterface.addIndex('groomer_unavailability', ['groomerId']);
      await queryInterface.addIndex('groomer_unavailability', ['startDate', 'endDate']);
      await queryInterface.addIndex('groomer_unavailability', ['clientId', 'regionId', 'storeId']);
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('groomer_unavailability');
    await queryInterface.dropTable('groomer_working_hours');
    await queryInterface.dropTable('store_operational_hours');
    await queryInterface.dropTable('holiday_list');
    await queryInterface.dropTable('groomers');
  },
};
