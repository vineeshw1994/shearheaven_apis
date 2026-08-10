'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pets', {
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
      profilePicture: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      petName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      breed: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      weight: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      age: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      dateOfBirth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown',
      },
      notesAllergies: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      allVaccinatedCurrent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      lastVaccinatedDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      behaviorNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    await queryInterface.addIndex('pets', ['userId']);
    await queryInterface.addIndex('pets', ['clientId', 'regionId', 'storeId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('pets');
  },
};
