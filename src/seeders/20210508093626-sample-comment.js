'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Comments', [
            {
                articleId: 1,
                userId: 4,
                body: 'ぜひコンピュータサイエンス興味あるので受けてみたい。。',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                articleId: 1,
                userId: 5,
                body: '受けます！',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                articleId: 3,
                userId: 6,
                body: '来年海外居住する者です。楽しみにしてます。',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                articleId: 3,
                userId: 2,
                body: '前回参加したけどとてもよかったです。でも今回行けなくて、残念。。',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                articleId: 5,
                userId: 5,
                body: '外貨預金に興味あります。イベントどれですか？',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                articleId: 5,
                userId: 3,
                body: '「日本人のための今後お金に困らないための経済勉強会」です。イベントページから探してみてください',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            
        ]);
    },

    down: async(queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Comments', null, {});
    }
};