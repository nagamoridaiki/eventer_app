"use strict";

const User = require("../models/user")
const Event = require("../models/event")
const Article = require("../models/article")
const Join = require("../models/join")
const Like = require("../models/like")
const Tag = require("../models/tag")
const Comment = require("../models/comment")
const EventTag = require("../models/eventtag")
const jsonWebToken = require('jsonwebtoken')
const db = require('../models/index')
const httpStatus = require('http-status');
const process = require('../config/process.js');
const moment = require('moment')
const path = require('path');
const sharp = require('sharp');

module.exports = {
    articleGetAll: async function () {
        const allArticle = await db.Article.findAll(
            {
                include: ['Comment', 'User', 'LikedUser'],
                order: [
                    ['id', 'DESC']
                ],
            }
        )

        return allArticle;
    },
    articleCreate: async function (ArticleId, params) {
        const newArticle = await db.Article.create({
            userId: ArticleId,
            title: params.title,
            detail: params.detail,
            //image: EventId + "event.jpg",
        }).catch((err) => {
            return err
        });
        return newArticle;
    },
    commentAdd: async function (userId, params) {
        const newArticle = await db.Comment.create({
            userId: userId,
            articleId: params.articleId,
            body: params.body,
            //image: EventId + "event.jpg",
        }).catch((err) => {
            return err
        });
        return newArticle;
    },
}