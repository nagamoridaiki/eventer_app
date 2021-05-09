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
const Message = require("../models/message")

module.exports = {
    index: async(req, res, next) => {
        //全イベント情報取得
        const articleAllData = await articlesUseCase.articleGetAll();

        let isLike = [];
        //投稿１つあたり
        for (let n = 0 ; n < articleAllData.length ; n++) {
            let likeUsers = articleAllData[n].LikedUser
            isLike[n] = 'yetLike'
            //いいねしたユーザー1人ごとにあたり
            for (let i = 0 ; i < likeUsers.length ; i++) {
                //ログインしているユーザーがいいねしているかどうかを判定する。
                if (likeUsers[i].id == req.session.user.id) {
                    isLike[n] = 'doLike'
                    break
                }
            }
        }

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
        req.session.newArticle = newArticleData.id
        next()
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
    imageUpload: async(req, res, next) => {
        const newArticleId = req.session.newArticle
        await articlesUseCase.fileUpload(req, res, next, newArticleId);

        req.session.newArticle = null;
        res.redirect('/articles');
    },
    messageSend: async(req, res, next) => {
        await articlesUseCase.messageSend(req.body)
        res.redirect('/user/'+req.body.receiveUserId);
    },




}