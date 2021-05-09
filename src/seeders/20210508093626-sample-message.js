'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Messages', [{
                sendUserId: 1,
                receiveUserId: 2,
                content: 'こんにちは2さん。私は1です。よろしくです。',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                sendUserId: 2,
                receiveUserId: 1,
                content: 'こんにちは1さん。私は2です。よろしくです。',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                sendUserId: 1,
                receiveUserId: 3,
                content: 'こんにちは3さん。私は1です。よろしくです。',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                sendUserId: 1,
                receiveUserId: 4,
                content: 'こんにちは4さん。私は1です。よろしくです。',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                sendUserId: 2,
                receiveUserId: 3,
                content: 'こんにちは3さん。私は2です。よろしくです。',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                sendUserId: 2,
                receiveUserId: 4,
                content: 'こんにちは4さん。私は2です。よろしくです。',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                sendUserId: 3,
                receiveUserId: 1,
                content: 'こんにちは1さん。私は3です。よろしくです。',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                sendUserId: 3,
                receiveUserId: 2,
                content: 'こんにちは2さん。私は3です。よろしくです。',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                sendUserId: 4,
                receiveUserId: 1,
                content: 'こんにちは1さん。私は4です。よろしくです。',
                createdAt: new Date(),
                updatedAt: new Date()
            },

        ]);
    },

    down: async(queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Messages', null, {});
    }
};