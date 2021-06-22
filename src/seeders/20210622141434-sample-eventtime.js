'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('EventTimes', [
            {
              start: 13,
              end: 14,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              start: 18,
              end: 20,
              createdAt: new Date(),
              updatedAt: new Date()
            },
        ]);
    },

    down: async(queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('EventTimes', null, {});
    }
};