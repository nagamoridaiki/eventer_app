'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Joins', [
            {
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
                userId: 1,
                eventId: 3,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 1,
                eventId: 5,
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
                userId: 2,
                eventId: 3,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 2,
                eventId: 4,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 2,
                eventId: 5,
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
                userId: 3,
                eventId: 3,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 3,
                eventId: 4,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 4,
                eventId: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 4,
                eventId: 4,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 4,
                eventId: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 5,
                eventId: 2,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 5,
                eventId: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 6,
                eventId: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 6,
                eventId: 4,
                createdAt: new Date(),
                updatedAt: new Date()
            },
        ]);
    },
    down: async(queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Joins', null, {});
    }
};