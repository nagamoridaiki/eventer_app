"use strict";

const User = require("../models/user")
const Event = require("../models/event")
const Article = require("../models/article")
const Join = require("../models/join")
const Like = require("../models/like")
const Tag = require("../models/tag")
const Comment = require("../models/comment")
const EventTag = require("../models/eventtag")
const Message = require("../models/message")
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
                    ['updatedAt', 'DESC']
                ],
            }
        )

        return allArticle;
    },
    getApdatedAt: function (article){
        let Year = moment(article.updatedAt).format('Y');
        let Month = moment(article.updatedAt).format('M');
        let Date = moment(article.updatedAt).format('D');
        let Time = moment(article.updatedAt).format('HH:mm');
        if (Month.length == 1) {
            Month = "0" + Month
        }
        if (Date.length == 1) {
            Date = "0" + Date
        }
        const updatedAt = {
            Year: Year,
            Month: Month,
            Date: Date,
            Time: Time
        };
        return updatedAt;
    },
    articleCreate: async function (ArticleId, params) {
        const newArticle = await db.Article.create({
            userId: ArticleId,
            detail: params.detail,
        }).catch((err) => {
            return err
        });
        return newArticle;
    },
    addComment: async function (userId, params) {
        const newArticle = await db.Comment.create({
            userId: userId,
            articleId: params.articleId,
            body: params.body,
        }).catch((err) => {
            return err
        });
        return newArticle;
    },
    delete: async function (articleId){
        await db.Article.destroy({
            where: { id: articleId }
        })
        return articleId;
    },
    SendMessage: async function (params) {
        const sendedMessage = await db.Message.create({
            sendUserId: params.sendUserId,
            receiveUserId: params.receiveUserId,
            content: params.content,
        }).catch((err) => {
            return err
        });
        return sendedMessage;
    },
    getCommentsById: async function (articleId) {
        let comments = await db.Comment.findAll({
            include: ['User', 'Article'],
            where: {
                articleId: articleId,
            },
            order: [
                ['updatedAt', 'DESC']
            ],
        }).catch(err => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        });
        return comments;
    }

}