'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Events', [{
                userId: 1,
                title: 'コンピュータサイエンス概論',
                subTitle: 'ハードウエアやソフトウエアの知識を学ぶIT初学者むけのセミナーです。',
                image: 'undefinedkeyboard-1385704__340.jpeg',
                detail: '現代においてITの知恵をビジネスに組み込むのは必須でしょう。今回はIT初学者、これからITを取り入れていきたいという方向けにハードウエアやソフトウエア、データ処理、アルゴリズムといった基礎から人工知能、データサイエンスといった少し応用まで具体的に話していこうと思います。',
                holdDate: '2021-06-10 10:00:00',
                capacity: 10,
                address: '東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 紀尾井タワー',
                price: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 1,
                title: 'プロジェクトのマネジメントセミナー',
                subTitle: 'チームメンバーの個々の強みを引き出し、最高の結果を出すためのチームの鉄則',
                image: 'undefinedbanner-1848703__480.jpeg',
                detail: '多くのチームプロジェクトで悩みの多くが「チームメンバーのモチベーション管理が難しい」「どのように個々の強みを引き出せるか」という悩みを多くのPMから聞きます。今回のセミナーではチームビルディングから体型的に話し、最終的にはうまくいっているチームの成功事例も交えてうまくいくチームの鉄則について話していこうと考えています。',
                holdDate: '2021-06-10 10:00:00',
                capacity: 20,
                address: '東京都新宿区西新宿6-5-1',
                price: 1000,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 2,
                title: 'webデザイン講座（HTML・CSS)',
                subTitle: 'HTMLとCSSでwebデザインの基礎を習得！チラシからホームページまで実践形式で手を動かして学ぶ講座！',
                image: 'undefinedcarousel-1684591__340.webp',
                detail: 'あなたがいつも見ているホームページやブログなどのウェブページは、HTMLとCSSなどのマークアップ言語からできています。今回はHTMLとCSSを学びwebデザインとしての基礎を身につけましょう。予習として参考図書を1冊読んでくるとベストです',
                holdDate: '2021-07-21 15:00:00',
                capacity: 30,
                address: '東京都渋谷区渋谷2丁目21-1',
                price: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 3,
                title: '日本人のための今後お金に困らないための経済勉強会',
                subTitle: '今日本が置かれている状況とリスクを克服するための対策とは？アジアの金融をうまく使いこなして資産を分散する術を紹介',
                image: 'undefinedpexels-photo-1519088.jpeg',
                detail: '日本はこれから人口減少、少子化、社会保障の破綻リスクなどを抱えながら経済に関しては明るい未来が見えてきません。しかし海外事情に目を向けるとリスクを乗り越えられる方法がたくさんあります。今回は資産を目減りさせないための経済・金融の知識を身につけていきましょう。',
                holdDate: '2021-07-21 13:00:00',
                capacity: 30,
                address: '東京都千代田区丸の内１丁目９−２',
                price: 2000,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 3,
                title: '第3回異文化交流会',
                subTitle: '多様な出身地の人が集まる異文化交流会の第3回。今回は広い会場に食事とお酒も添えてパーティー形式で交流できるようにしました',
                image: 'undefinedOIP (1).jpeg',
                detail: '自分と異なる文化や考え方をもつ人と対話を交わし、ともに今後の親交を深めたいと願う方のご参加をお待ちしています。',
                holdDate: '2021-07-20 14:00:00',
                capacity: 30,
                address: '東京都新宿区市谷八幡町８−番地 TKP市ヶ谷ビル',
                price: 2000,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 1,
                title: '代々木バーベーキュー大会',
                subTitle: '代々木公園の施設を貸し切って大型バーベキューをします。お肉とお酒でいつもの友達や新しい友達とわいわい楽しく交流しましょう。',
                image: 'undefinedOIP.jpeg',
                detail: '予約いただくだけでOKです。食材、お酒、イスなど全てご用意しております。雨の日でも問題ない屋根付き。お腹いっぱいになったら公園で休んでも遊んでもいいでしょう。家族連れ、ご友人、お一人様問いません。楽しみたいという方なら誰でも歓迎！',
                holdDate: '2021-06-12 11:00:00',
                capacity: 50,
                address: '東京都渋谷区代々木神園町２−１',
                price: 5000,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 2,
                title: '朝活~おすすめ本紹介~ in 代官山',
                subTitle: '平日早起きして最近読んだおすすめの本の紹介をしあいましょう。朝の意識が１日を作る！',
                image: 'undefinedbooks_haikei.jpeg ',
                detail: '最近読んだ本は小説でもビジネス書でも構いません。お互いに最近読んだ本の紹介・レビューをしながら新しい本との出会い、人との交流を楽しみましょう。仕事前にモチベーションの向上とコミュニケーションのアップにも効果的です！',
                holdDate: '2021-06-10 07:00:00',
                capacity: 10,
                address: '東京都渋谷区猿楽町１７−５',
                price: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 1,
                title: '非エンジニアのための人工知能(AI)セミナー',
                subTitle: '人工知能の第一人者、松尾豊をゲストに迎えて、人工知能開発に必要な知識を網羅的にカバーしたセミナーです。',
                image: 'undefineddigitization-5140045__480.webp',
                detail: '人工知能の第一人者、松尾豊をゲストに迎えて現在の人工知能の活躍の場面、そして2040年に向けてこれから世界はどうなるのかをお話します。全ビジネスマンは人工知能によってこれからどのように人工知能と向き合えば良いのか、、？',
                holdDate: '2021-06-10 19:00:00',
                capacity: 50,
                address: '東京都千代田区大手町１丁目６−１',
                price: 4000,
                createdAt: new Date(),
                updatedAt: new Date()
            },
        ]);
    },

    down: async(queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Events', null, {});
    }
};