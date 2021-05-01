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
const favoriteUseCase = require('../usecase/favorite')
const Like = require("../models/like")
const Article = require("../models/article")

module.exports = {
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
            res.redirect('/events');
        });
    },



}