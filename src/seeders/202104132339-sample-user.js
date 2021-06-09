'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Users', [{
                name: 'Taro',
                password: 'yamada',
                email: 'taro@yamada.jp',
                image: '1Tarojon.jpeg',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Hanako',
                password: 'flower',
                email: 'hanako@flower.com',
                image: '2Hanakoakiko.jpeg',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Jiro',
                password: 'change',
                email: 'jiro@change.com',
                image: '3Jiroakio.jpeg',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Sachiko',
                password: 'happy',
                email: 'sachiko@happy.jp',
                image: '4Sachikoazusa.jpeg',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Saburo',
                password: 'Saburo',
                email: 'Saburo@saburo.jp',
                image: '5Saburosaburo.jpeg',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Siro',
                password: 'Siro',
                email: 'Siro@siro.jp',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    down: async(queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Users', null, {});
    }
};