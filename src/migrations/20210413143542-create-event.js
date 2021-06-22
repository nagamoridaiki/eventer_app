'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      subTitle: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
      },
      detail: {
        type: Sequelize.STRING
      },
      EventDateId: {
        type: Sequelize.INTEGER
      },
      EventTimeId: {
        type: Sequelize.INTEGER
      },
      isPrivate: {
        type: Sequelize.BOOLEAN
      },
      capacity: {
        type: Sequelize.INTEGER
      },
      address: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Events');
  }
};