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
        console.log("params", params)
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
    fileUpload: async function (req, res, next) {
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
            let uploadPath = path.join(`./public/img/upload_icon/${saveFilename}`);
        
            console.log(`ファイル名: ${uploadFile.name}`);
            console.log(`保存パス: ${uploadPath}`);
        
            // メモリ上にあるファイルをサーバーパスへ移動させる
            uploadFile.mv( uploadPath, async(err) => {

                if (err) {
                return res.status(500).send(err);
                }
                // sharpをt使ってリサイズする時のファイル名
                const resizeURL = `${path.basename(saveFilename, path.extname(saveFilename))}-resize.jpg`;

                sharp(uploadPath).resize(200, 200, {
                    fit: 'inside'
                }).toFile(path.join(`./public/img/upload_icon/${resizeURL}`), (err, info)=>{
                    if(err){
                        throw err 
                    }
                    console.log(info);
                });

                await db.User.update({
                    image: resizeURL,
                }, {
                    where: { id: req.session.user.id, }
                }).catch(err => {
                    res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
                })
                res.redirect('/user/' + req.session.user.id)
                
            });
        } catch (err) {
            console.log(err); next(err);
        }
    },
    findFollowee: async function (res, oneUser, loginUserId) {
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
    isArticleWrittenByFollower: async function (res, articleAllData, follow) {
        //フォローした人の記事かどうか
        let articleList = [];
        //フォローしてる人が
        for (let i = 0 ; i < follow.length ; i++) {
            //その投稿を書いた人であれば
            for (let m = 0 ; m < articleAllData.length ; m++) {
                //フォローした人のidと投稿した人のidが一致すれば
                if (follow[i].id == articleAllData[m].userId) {
                    articleList.push(articleAllData[m])
                }
            }
        }
        return articleList;
    },
    isLikedToArticle: async function (req, articleList) {
        let isLike = [];
        //投稿１つあたり
        for (let n = 0 ; n < articleList.length ; n++) {
            let likeUsers = articleList[n].LikedUser
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
        return isLike
    },
    getOthersUsers: async function (req, users) {
        let friends = []
        for (let i = 0 ; i < users.length ; i++) {
            //ログインユーザー以外の全ての友達
            if (users[i].id != req.session.user.id) {
                friends.push(users[i])
            }
        }
        return friends
    },
    isFollow: async function (req, friends) {
        let isFollow = []
        //その友達ひとりずつに対して
        for (let n = 0 ; n < friends.length ; n++) {
            //フォロワーが一人もいない場合
            if (friends[n].followee.length == 0) {
                isFollow[n] = false
            }
            
            let followee = friends[n].followee;
            //フォロワーをひとりずつ確認して
            for (let m = 0 ; m < followee.length ; m++) {
                //ログインユーザーがフォロワーの中にいれば
                if (followee[m].id == req.session.user.id) {
                    isFollow[n] = true
                } else {
                    isFollow[n] = false
                }
            }
        }
        return isFollow
    },



}