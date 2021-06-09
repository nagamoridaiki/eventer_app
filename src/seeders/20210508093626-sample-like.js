'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Likes', [
            {
                userId: 1,
                articleId: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 1,
                articleId: 2,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 1,
                articleId: 3,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 1,
                articleId: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 2,
                articleId: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 2,
                articleId: 3,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 2,
                articleId: 4,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 2,
                articleId: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 3,
                articleId: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 3,
                articleId: 2,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 3,
                articleId: 3,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 3,
                articleId: 4,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 4,
                articleId: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 4,
                articleId: 4,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 4,
                articleId: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 5,
                articleId: 2,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 5,
                articleId: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 6,
                articleId: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 6,
                articleId: 4,
                createdAt: new Date(),
                updatedAt: new Date()
            },
        ]);
    },

    down: async(queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Likes', null, {});
    }
};