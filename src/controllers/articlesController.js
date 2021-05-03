"use strict";

const User = require("../models/user")
const Event = require("../models/event")
const Join = require("../models/join")
const Tag = require("../models/tag")
const EventTag = require("../models/eventtag")
const jsonWebToken = require('jsonwebtoken')
const db = require('../models/index')
const httpStatus = require('http-status');
const process = require('../config/process.js');
const moment = require('moment')
const eventUseCase = require('../usecase/events')
const articlesUseCase = require('../usecase/articles')
const tagUseCase = require('../usecase/tags')
const userUseCase = require('../usecase/users')
const joinUseCase = require('../usecase/joins')
const likeUseCase = require('../usecase/likes')
const favoriteUseCase = require('../usecase/favorite')
const Like = require("../models/like")
const Article = require("../models/article")

module.exports = {
    index: async(req, res, next) => {
        //全イベント情報取得
        const articleAllData = await articlesUseCase.articleGetAll();
        //res.json(articleAllData)

        let isLike = [];
        //あなたはそのイベントに参加予定か？
        articleAllData.forEach(article => {
            //その投稿にいいねがあれば
            if (article.LikedUser[0]) {
                //ログインしているユーザーがいいねしているかどうかを判定する。
                if (article.LikedUser[0].id == req.session.user.id) {
                    isLike.push('doLike')//ログインしているユーザーがいいねしている
                } else {
                    isLike.push('yetLike')//ログインユーザーではない他の誰かがいいねしている。
                }
            } else {
                isLike.push('yetLike')//誰もいいねしていない
            }
        });

        //console.log("articleAllDataの中身", articleAllData[0].Comment[0]);

        //res.json(articleAllData)
        const data = {
            title: '投稿',
            login: req.session.user,
            content: {
                article: articleAllData,
                isLike: isLike
            },
        }
        res.render('layout', { layout_name: 'articles/articleList', data });

    },
    add: (req, res, next) => {
        const data = {
            title: 'Articles/Add',
            login: req.session.user,
            err: null
        }
        res.render('layout', { layout_name: 'articles/add', data });
    },
    create: async(req, res, next) => {
        //投稿作成
        const newArticleData = await articlesUseCase.articleCreate(req.session.user.id, req.body);
        //タグ作成およびイベントとの紐付け
        let tags = JSON.parse(req.body.tags);
        //tagの数だけ繰り返す
        tags.forEach(async function(tag, key ) {
            //入力したタグをDBから探し、なければ作成する。
            let findTag = await tagUseCase.findOrCreate(res, tag);
            //タグをイベントと紐付け
            tagUseCase.articleTagCreate(res, newArticleData, findTag)
            
            req.session.newArticle = newArticleData.id
            //next()
            res.redirect('/articles');
        });
    },
    like: async(req, res, next) => {

        //いいねしているかを判定する。
        const likeData = await likeUseCase.findOne(req.body);

        //参加表明と参加辞退を切り替える
        likeData ? await likeUseCase.unlike(res, req.body) : await likeUseCase.like(res, req.body)

        res.redirect('/articles');
    },
    commentAdd: async(req, res, next) => {
        //コメント投稿
        await articlesUseCase.commentAdd(req.session.user.id, req.body);
        res.redirect('/articles');
    },



}