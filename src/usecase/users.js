"use strict";

const User = require("../models/user")
const Event = require("../models/event")
const Join = require("../models/join")
const Tag = require("../models/tag")
const EventTag = require("../models/eventtag")
const Follow = require("../models/follow")
const Message = require("../models/message")
const jsonWebToken = require('jsonwebtoken')
const db = require('../models/index')
const httpStatus = require('http-status');
const process = require('../config/process.js');
const moment = require('moment')
const path = require('path');
const sharp = require('sharp');
const { Op } = require("sequelize");

const AWS = require('aws-sdk');
var awsCredFile = path.join(__dirname, '../config/AwsConfig.json');
AWS.config.loadFromPath(awsCredFile);

module.exports = {
    findOneUser: async function (res, userId) {
        const oneUser = await db.User.findOne({
            where: {
                id: userId
            },
            include: ['Event', 'FavoriteEvent', 'follower', 'followee'],
        }).catch(err => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        });
        return oneUser
    },
    findForPayload: async function (res, params) {
        const oneUser = await db.User.findOne({
            where: {
                email: params.email,
                password: params.password,
            }
        }).catch(err => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        });
        return oneUser
    },
    userGetAll: async function () {
        const allUsers = await db.User.findAll({
            include: ['Event', 'FavoriteEvent', 'follower', 'followee'],
        })
        .catch(err => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        });
        return allUsers;
    },
    userCreate: async function (res, params) {
        const newUser = await db.User.create({
            name: params.name,
            password: params.password,
            email: params.email,
            selfIntroduction: params.selfIntroduction,
        }).catch(err => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        });
        return newUser;
    },
    userDelete: async function (res, userId){
        await db.User.destroy({
            where: { id: userId }
        }).catch(err => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        });
        return true;
    },
    userUpdate: async function (res, params) {
        const updatedUser = await db.User.update({
            name: params.name,
            selfIntroduction: params.selfIntroduction,
            password: params.password,
            email: params.email,
        },{
            where: { id: params.id, }
        }
        ).catch(err => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        });
        return updatedUser;
    },
    fileUploadToS3: async function (req, res, next) {
        const s3 = new AWS.S3();
        const fileContent  = Buffer.from(req.files.uploadFile.data, 'binary');
        const fileName = req.session.user.id + req.session.user.name + req.files.uploadFile.name//画像名
    
        const params = {
            Bucket: 'eventernagamori/users',
            Key: fileName,
            Body: fileContent 
        };

        await db.User.update({
            image: fileName,
        }, {
            where: { id: req.session.user.id }
        }).catch(err => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        })
    
        s3.upload(params, function(err, data) {
            if (err) {
                throw err;
            }
        });
        res.redirect('/user/' + req.session.user.id)

    },
    discoveredFollowee: async function (res, oneUser, loginUserId) {
        let alwaysFollow = false;
        let followee =  oneUser.followee;
        
        for (let i = 0 ; i < followee.length ; i++) {
            if (followee[i].id == loginUserId) {
                alwaysFollow = true
                break
            }
        }
        return alwaysFollow
    },
    attachFollow: async function (res, followId, loginUserId) {
        await db.Follow.create({
            follower: loginUserId,
            followee: followId,
        }).catch(err => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        });
        return true
    },
    detachFollow: async function (res, followId, loginUserId) {
        await db.Follow.destroy({
            where: { 
                follower: loginUserId,
                followee: followId, 
            }
        }).catch(err => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        });
        return true
    },
    getAllMessages: async function (res, purposeUserId, MyLoginId) {
        //送信元がログインユーザー、送信先が見ている相手先または
        //送信元が見ている相手先、送信先がログインユーザーのDMを全て取得する
        let allMessages = await db.Message.findAll({
            where: {
                [Op.or]: [
                    {
                        sendUserId: purposeUserId,
                        receiveUserId: MyLoginId
                    },
                    {
                        sendUserId: MyLoginId,
                        receiveUserId: purposeUserId
                    }
                ]
            },
            order: [
                ['updatedAt', 'ASC']
            ],
        });
        return allMessages;
    },
    isArticleByFollower: async function (res, allArticleData, user) {
        //フォローした人の記事かどうか
        let articleList = [];

        for (let m = 0 ; m < allArticleData.length ; m++) {
            //フォローしてる人が書いた場合
            for (let i = 0 ; i < user.follower.length ; i++) {
                //フォローした人のidと投稿した人のidが一致すれば
                if (user.follower[i].id == allArticleData[m].userId) {
                    articleList.push(allArticleData[m])
                }
            }
            //ログインユーザーが書いたつぶやきも対象
            if (user.id == allArticleData[m].userId) {
                articleList.push(allArticleData[m])
            }
        }
        return articleList;
    },
    isYourLikeToArticle: async function (req, articleList) {
        let yourLikeFlg = [];
        //投稿１つあたり
        for (let n = 0 ; n < articleList.length ; n++) {
            let usersLikeList = articleList[n].LikedUser
            yourLikeFlg[n] = 'yetLike'
            //いいねしたユーザー1人ごとにあたり
            for (let i = 0 ; i < usersLikeList.length ; i++) {
                //ログインしているユーザーがいいねしているかどうかを判定する。
                if (usersLikeList[i].id == req.session.user.id) {
                    yourLikeFlg[n] = 'doLike'
                    break
                }
            }
        }
        return yourLikeFlg
    },
    getOthersUsers: async function (req, users) {
        let othersUsers = []
        for (let i = 0 ; i < users.length ; i++) {
            //ログインユーザー以外の全ての友達
            if (users[i].id != req.session.user.id) {
                othersUsers.push(users[i])
            }
        }
        return othersUsers
    },
    isYourFollow: async function (req, otherUsers) {
        let isYourFollow = []
        //その友達ひとりずつに対して
        for (let n = 0 ; n < otherUsers.length ; n++) {
            //フォロワーが一人もいない場合
            if (otherUsers[n].followee.length == 0) {
                isYourFollow[n] = false
            }
            
            let followee = otherUsers[n].followee;
            //フォロワーをひとりずつ確認して
            for (let m = 0 ; m < followee.length ; m++) {
                //ログインユーザーがフォロワーの中にいれば
                if (followee[m].id == req.session.user.id) {
                    isYourFollow[n] = true
                } else {
                    isYourFollow[n] = false
                }
            }
        }
        return isYourFollow
    },
    searchUserByName: async function (req, res) {
        let discoveredUsers = await db.User.findAll({
            include: ['Event', 'FavoriteEvent', 'follower', 'followee'],
            where: {
                name: {
                    [Op.like]: '%'+ req.body.name +'%'//文字を含む
                  }
            },
            order: [
                ['updatedAt', 'ASC']
            ],
        }).catch(err => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        });
        return discoveredUsers;
    }



}