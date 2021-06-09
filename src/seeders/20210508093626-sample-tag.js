'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Tags', [
            {
                name: '初学者',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                name: 'IT',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                name: 'マネジメント',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                name: 'リーダー',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                name: 'エンジニア',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                name: '人工知能',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                name: '食事',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                name: 'お酒',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                name: '交流',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                name: 'オフ会',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                name: '読書',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                name: '朝活',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                name: 'デザイン',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                name: '海外',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                name: 'お金',
                createdAt: new Date(),
                updatedAt: new Date()

            },
        ]);
    },

    down: async(queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Tags', null, {});
    }
};