'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('EventTags', [
            {
                eventId: 1,
                tagId: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 1,
                tagId: 2,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 2,
                tagId: 2,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 2,
                tagId: 3,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 2,
                tagId: 4,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 8,
                tagId: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 8,
                tagId: 6,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 8,
                tagId: 2,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 6,
                tagId: 7,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 6,
                tagId: 8,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 6,
                tagId: 9,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 6,
                tagId: 10,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 7,
                tagId: 11,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 7,
                tagId: 10,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 7,
                tagId: 12,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 3,
                tagId: 2,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 3,
                tagId: 13,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 5,
                tagId: 9,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 5,
                tagId: 14,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 4,
                tagId: 14,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                eventId: 4,
                tagId: 15,
                createdAt: new Date(),
                updatedAt: new Date()
            },
        ]);
    },

    down: async(queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('EventTags', null, {});
    }
};