'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Articles', [{
                userId: 1,
                image: null,
                detail: '本屋巡りに行きました。',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 2,
                image: null,
                detail: '森林浴をしに行きました。',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 3,
                image: null,
                detail: '海外渡航者のために勉強会をします。',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 4,
                image: null,
                detail: 'ビアガーデンしました',
                createdAt: new Date(),
                updatedAt: new Date()
            },
        ]);
    },

    down: async(queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Articles', null, {});
    }
};