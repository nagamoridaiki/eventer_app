# 掲示板メッセンジャーアプリ

## Overview
 
イベント情報のプラットフォームアプリを作成しました。

![](https://eventernagamori.s3.ap-northeast-1.amazonaws.com/fixedImage/event_list.png)


![](https://eventernagamori.s3.ap-northeast-1.amazonaws.com/fixedImage/event_detail.png)


![](https://eventernagamori.s3.ap-northeast-1.amazonaws.com/fixedImage/googlemapapi.png)

![](https://eventernagamori.s3.ap-northeast-1.amazonaws.com/fixedImage/payment.png)

![](https://eventernagamori.s3.ap-northeast-1.amazonaws.com/fixedImage/tweet_comment.png)


# 主な機能

* ユーザー登録/ログイン/ログアウト
* イベントの投稿/更新/削除
* google map apiによるイベント会場のマップ表示
* stripeによるイベント料金のオンライン決済
* つぶやきへのコメント
* つぶやきへのいいね
* タグごとの検索
* お気に入り検索
* 参加したイベントの絞り込み
* ユーザープロフィール
* フォロー・フォロワー
* ユーザー間のダイレクトメッセージ機能


# インフラ構成図
![](https://eventernagamori.s3.ap-northeast-1.amazonaws.com/fixedImage/aws_diagram.png)


# 使用技術

バックエンド
* node.js:12.0
* express.js

フロントエンド
* ejs

インフラ
* AWS(VPC/EC2/RDS/Route53/ELB/ACM/S3)

環境構築
* Docker/docker-compose

  webサーバー
  * node:12

  データベース
  * MySQL5.7（開発）
  * MySQL5.7（本番）




