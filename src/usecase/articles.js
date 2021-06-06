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
    commentAdd: async function (userId, params) {
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
    fileUpload: async function (req, res, next, newArticleId) {
        try {
    
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).send('No files were uploaded');
            }
        
            let uploadFile = req.files.uploadFile;
        
            // アップロードファイルは20MB以内
            if (uploadFile.size > 20*1024*1024) {
              return res.status(400).send('File size is too big');
            }
        
            // 対応しているのはpng, jpg, gif, jpegのファイルとする
            let uploadFileExt = path.extname(uploadFile.name);
        
            if(uploadFileExt !== '.png' && uploadFileExt !== '.jpg' && uploadFileExt !== '.gif' && uploadFileExt !== '.jpeg') {
              return res.status(400).send('Only png, jpg, gif and jpeg are available');
            }
        
            // 保存するファイル名は同じファイル名が生じるケースを考えてDate.now()をつけたす
            let saveFilename = `${path.basename(uploadFile.name, uploadFileExt)}-${Date.now()}${uploadFileExt}`;
        
            // サーバー上の保存位置
            let uploadPath = path.join(`./public/img/uploard_articles/${saveFilename}`);
        
            console.log(`ファイル名: ${uploadFile.name}`);
            console.log(`保存パス: ${uploadPath}`);
        
            // メモリ上にあるファイルをサーバーパスへ移動させる
            uploadFile.mv( uploadPath, async(err) => {

                if (err) {
                return res.status(500).send(err);
                }
                // sharpをt使ってリサイズする時のファイル名
                const resizeURL = `${path.basename(saveFilename, path.extname(saveFilename))}-resize.jpg`;

                sharp(uploadPath).resize(400, 400, {
                    fit: 'inside'
                }).toFile(path.join(`./public/img/uploard_articles/${resizeURL}`), (err, info)=>{
                    if(err){
                        throw err 
                    }
                    console.log(info);
                });

                await db.Article.update({
                    image: resizeURL,
                }, {
                    where: { id: newArticleId }
                }).catch(err => {
                    res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
                })

                res.redirect('/articles/')
            });
        } catch (err) {
            console.log(err); next(err);
        }
    },
    messageSend: async function (params) {
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