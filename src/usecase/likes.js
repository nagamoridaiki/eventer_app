"use strict";

const User = require("../models/user")
const Event = require("../models/event")
const Join = require("../models/join")
const Like = require("../models/like")
const Tag = require("../models/tag")
const EventTag = require("../models/eventtag")
const jsonWebToken = require('jsonwebtoken')
const db = require('../models/index')
const httpStatus = require('http-status');
const process = require('../config/process.js');
const moment = require('moment')

module.exports = {
    findOne: async function (params) {
        const likeData = await db.Like.findOne({
            where: {
                userId: params.userId,
                articleId: params.articleId,
            }
        });
        return likeData;
    },
    //いいねを外す
    unlike: async function (res, params) {
        await db.Like.destroy({
            where: {
                userId: params.userId,
                articleId: params.articleId,
            }
        }).catch((err) => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        });
    },
    //いいねをつける
    like: async function (res, params) {
        //res.json(params)
        await db.Like.create({
            userId: params.userId,
            articleId: params.articleId,
        }).catch((err) => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        });
    },
    
}