'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('EventDates', [
            {
              year: 2021,
              month: 1,
              day: 2,
              hour: 18,
              time: 1,
              createdAt: new Date(),
              updatedAt: new Date()

            },
            {
              year: 2021,
              month: 2,
              day: 2,
              hour: 18,
              time: 1,
              createdAt: new Date(),
              updatedAt: new Date()

            },
            {
              year: 2021,
              month: 3,
              day: 2,
              hour: 18,
              time: 1,
              createdAt: new Date(),
              updatedAt: new Date()

            },
            {
              year: 2021,
              month: 4,
              day: 2,
              hour: 18,
              time: 1,
              createdAt: new Date(),
              updatedAt: new Date()

            },
            {
              year: 2021,
              month: 5,
              day: 2,
              hour: 18,
              time: 1,
              createdAt: new Date(),
              updatedAt: new Date()

            },
            {
              year: 2021,
              month: 6,
              day: 2,
              hour: 18,
              time: 1,
              createdAt: new Date(),
              updatedAt: new Date()

            },
            {
              year: 2021,
              month: 7,
              day: 2,
              hour: 18,
              time: 1,
              createdAt: new Date(),
              updatedAt: new Date()

            },
            {
              year: 2021,
              month: 8,
              day: 2,
              hour: 18,
              time: 1,
              createdAt: new Date(),
              updatedAt: new Date()

            },
            
        ]);
    },

    down: async(queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Tags', null, {});
    }
};