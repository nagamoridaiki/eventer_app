'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Events', [{
                userId: 1,
                title: 'テストタイトル1つめ',
                subTitle: 'テストのサブタイトルです。',
                detail: 'これはテストのイベント詳細です。この部分には長く文字が入ります。',
                holdDate: new Date(),
                capacity: 10,
                address: '東京都千代田区丸の内１丁目９',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
              userId: 1,
              title: 'テストタイトル2つめ',
              subTitle: 'テストのサブタイトル2つめです。',
              detail: 'これは2つめのテストのイベント詳細です。この部分には長く文字が入ります。',
              holdDate: new Date(),
              capacity: 20,
              address: '東京都新宿区新宿３丁目３８',
              createdAt: new Date(),
              updatedAt: new Date()
          },
        ]);
    },

    down: async(queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Events', null, {});
    }
};