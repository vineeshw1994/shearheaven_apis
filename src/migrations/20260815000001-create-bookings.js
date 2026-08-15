'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('bookings')) {
      return;
    }

    await queryInterface.createTable('bookings', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      petId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'pets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      serviceId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      packageId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      addOnIds: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      groomerId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      bookingDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      startTime: {
        type: Sequelize.STRING(5),
        allowNull: false,
      },
      endTime: {
        type: Sequelize.STRING(5),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('confirmed', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'confirmed',
      },
      totalDurationMinutes: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      totalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
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

    await queryInterface.addIndex('bookings', ['userId']);
    await queryInterface.addIndex('bookings', ['petId']);
    await queryInterface.addIndex('bookings', ['groomerId']);
    await queryInterface.addIndex('bookings', ['bookingDate']);
    await queryInterface.addIndex('bookings', ['clientId', 'regionId', 'storeId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('bookings');
  },
};
