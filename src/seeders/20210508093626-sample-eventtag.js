'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('EventTags', [{
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
        ]);
    },

    down: async(queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('EventTags', null, {});
    }
};