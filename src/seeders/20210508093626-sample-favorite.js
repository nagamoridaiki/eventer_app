'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Favorites', [{
                userId: 1,
                eventId: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 1,
                eventId: 2,
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                userId: 2,
                eventId: 1,
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                userId: 3,
                eventId: 1,
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                userId: 3,
                eventId: 2,
                createdAt: new Date(),
                updatedAt: new Date()

            },

            {
                userId: 4,
                eventId: 1,
                createdAt: new Date(),
                updatedAt: new Date()

            },
        ]);
    },

    down: async(queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Favorites', null, {});
    }
};