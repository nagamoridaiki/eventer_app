'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Tags', [{
                name: 'test',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                name: 'book',
                createdAt: new Date(),
                updatedAt: new Date()

            },
        ]);
    },

    down: async(queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Tags', null, {});
    }
};