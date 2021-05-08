'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Follows', [{
                follower: 1,
                followee: 2,
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                follower: 2,
                followee: 1,
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                follower: 1,
                followee: 3,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                follower: 1,
                followee: 4,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                follower: 2,
                followee: 3,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                follower: 2,
                followee: 4,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                follower: 3,
                followee: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                follower: 3,
                followee: 2,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                follower: 4,
                followee: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },

        ]);
    },

    down: async(queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Follows', null, {});
    }
};