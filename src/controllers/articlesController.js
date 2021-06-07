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
        const allArticleData = await articlesUseCase.articleGetAll()
        //ログインしてるユーザー
        let user = await userUseCase.findOneUser(res, req.session.user.id);
        //フォローした人の記事かどうか
        let articleList = await userUseCase.isArticleByFollower(res, allArticleData, user)
        //フォローした人の記事にいいねしているか
        let isLike = await userUseCase.isYourLikeToArticle(req, articleList)

        let updatedArticleDate = [];
        let commentList = []
        let commentUpdatedAt = []
        for (let i = 0 ; i < articleList.length ; i++) {
            //記事更新日時表示
            updatedArticleDate.push(articlesUseCase.getApdatedAt(articleList[i]));
            //各つぶやきに対するコメント
            let comments = await articlesUseCase.getCommentsById(articleList[i].id)
            let updatedCommentDate = [];

            for (let n = 0 ; n < comments.length ; n++) {
                //コメント更新日時表示
                updatedCommentDate.push(articlesUseCase.getApdatedAt(comments[n]));
            }
            commentList[i] = comments
            commentUpdatedAt[i] = updatedCommentDate
        }

        const data = {
            title: '投稿',
            login: req.session.user,
            content: {
                article: articleList,
                updatedDate: updatedArticleDate,
                comment: commentList,
                commentUpdated: commentUpdatedAt,
                isLike: isLike,
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
        res.redirect('/articles')
    },
    delete: async(req, res, next) => {
        await articlesUseCase.delete(req.params.id);
        res.redirect('/articles');
    },
    like: async(req, res, next) => {
        //いいねしているかを判定する。
        const likeData = await likeUseCase.findOne(req.body);
        //参加表明と参加辞退を切り替える
        likeData ? await likeUseCase.unlike(res, req.body) : await likeUseCase.like(res, req.body)

        res.redirect('/articles');
    },
    addComment: async(req, res, next) => {
        //コメント投稿
        await articlesUseCase.addComment(req.session.user.id, req.body);
        res.redirect('/articles');
    },
    imageUpload: async(req, res, next) => {
        if (!req.files) {
            req.session.newArticle = null;
            res.redirect('/articles')
        }
        const newArticleId = req.session.newArticle
        await articlesUseCase.fileUpload(req, res, next, newArticleId);

        req.session.newArticle = null;
        res.redirect('/articles');
    },
    SendMessage: async(req, res, next) => {
        await articlesUseCase.SendMessage(req.body)
        res.redirect('/user/'+req.body.receiveUserId);
    },




}