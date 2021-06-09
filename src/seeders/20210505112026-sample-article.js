'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Articles', [
            {
                userId: 1,
                image: null,
                detail: 'IT初学者のための講座を用意しました。ぜひ受けてみてください。6月の上旬です！',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 2,
                image: null,
                detail: 'webデザイン講座を企画しました。これからwebデザイナーになりたいっていう人はぜひおすすめです。',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 3,
                image: null,
                detail: '海外の人を読んでまた、大規模に異文化交流会をやります！前回大好評だったのでぜひ海外居住考えてる人とか海外就職したい人とかにおすすめなので参加してみてください！',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 4,
                image: null,
                detail: '最近、暑くてやる気が出にくい。そんな時にやる気が出る方法ゆる募でーす',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 3,
                image: null,
                detail: 'お金に困らないためのセミナーやります。最終的には香港の預金口座を持つためのツアーが今後あるので、ぜひ興味ある人参加ください',
                createdAt: new Date(),
                updatedAt: new Date()
            },
        ]);
    },

    down: async(queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Articles', null, {});
    }
};