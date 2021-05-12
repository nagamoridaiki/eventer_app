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
const tagUseCase = require('../usecase/tags')
const userUseCase = require('../usecase/users')
const joinUseCase = require('../usecase/joins')
const path = require('path');
const sharp = require('sharp');


const multer = require('multer')
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, 'image.jpg')
    }
})
const upload = multer({ storage: storage })

module.exports = {
    login: async(req, res, next) => {
        const data = {
            title: 'login',
            login: null
        }
        res.render('layout', { layout_name: 'login', title: 'login', data });
    },
    register: async(req, res, next) => {
        const data = {
            title: 'Register',
            login: req.session.user,
        }
        res.render('layout', { layout_name: 'Register', title: 'Register', data });
    },

    index: async(req, res, next) => {
        const users = await userUseCase.userGetAll();
        const data = {
            title: 'Register',
            login: req.session.user,
            users: users
        }
        res.render("layout", { layout_name: 'index', title: 'Index', data} );
    },
    indexView: (req, res) => {
        res.render("layout", { layout_name: 'index', title: 'Index' });
    },
    create: async(req, res, next) => {
        const newUser = await userUseCase.userCreate(res, req.body);
        const payload = {
            id: newUser.id,
            email: newUser.email,
            password: newUser.password
        }
        console.log("payload", payload) //{ id: 1, name: 'Taro', password: 'yamada' }
        const token = jsonWebToken.sign(payload, 'secret');
        req.session.token = token;
        res.redirect('/')
    },
    delete: async(req, res, next) => {
        await userUseCase.userDelete(res, req.body.id);
        res.redirect('/');
    },
    apiAuthenticate: async(req, res, next) => {
        await db.User.findOne({
            where: {
                email: req.body.email,
                password: req.body.password,
            }
        }).then(usr => {
            if (usr != null) {
                const payload = {
                    id: usr.id,
                    email: usr.email,
                    password: usr.password
                }
                const token = jsonWebToken.sign(payload, process['JWT_SECRET']);
                req.session.token = token;
                req.session.user = usr;
                next()
            } else {
                res.render('layout', { layout_name: 'error', title: 'ERROR', msg: 'ユーザーが見つかりませんでした。' });
                res.sendStatus(500)
            }
        })
    },
    verifyJWT: (req, res, next) => {
        const token = req.session.token
        if (token) {
            jsonWebToken.verify(token, process['JWT_SECRET'], function(error, decoded) {
                if (error) {
                    return res.json({ success: false, message: 'トークンの認証に失敗しました。' });
                } else {
                    // 認証に成功したらdecodeされた情報をrequestに保存する
                    console.log("認証に成功しました")
                    req.decoded = decoded;
                    next();
                }
            })
        } else {
            res.redirect('/login')
        }
    },
    logout: (req, res, next) => {
        req.session.token = null;
        res.redirect('/login')
    },
    myProf: async(req, res, next) => {
        //userIdを引き取る
        const UserId = req.params.id;
        const oneUser = await userUseCase.findOneUser(res, UserId);

        //ログインユーザーがそのユーザーをフォローしているか
        let follow_flg = await userUseCase.findFollowee(res, oneUser, req.session.user.id);

        //そのユーザーとのDM履歴取得
        let messagesList = await userUseCase.getAllMessages(res, UserId, req.session.user.id);
        //res.json(messagesHistory)


        
        //取得したuser情報をもとに画面にレンダリング
        const data = {
            title: 'マイプロフィール',
            user: oneUser,
            follow_flg: follow_flg,
            err: null,
            login: req.session.user,
            messagesList: messagesList,
        }
        res.render('layout', { layout_name: 'myprof', data });
    },
    Edit: async(req, res, next) => {
        //userIdを引き取る
        const UserId = req.session.user.id;
        const oneUser = await userUseCase.findOneUser(res, UserId);
        //取得したuser情報をもとに画面にレンダリング
        const data = {
            title: 'プロフィール編集',
            user: oneUser,
            err: null,
            login: req.session.user,
        }
        res.render('layout', { layout_name: 'myprofEdit', data });
    },
    update: async(req, res, next) => {
        const oneUser = await userUseCase.userUpdate(res, req.body);
        //取得したuser情報をもとに画面にレンダリング
        res.redirect('/user/' + req.session.user.id)
    },
    imageUpload: async(req, res, next) => {
        await userUseCase.fileUpload(req, res, next);
        
        res.redirect('/user/' + req.session.user.id)
    },
    follow: async(req, res, next) => {
        const followId = req.params.id;
        const findUser = await userUseCase.findOneUser(res, followId);
        //ログインユーザーがそのユーザーをフォローしているか
        let alwaysFollow = await userUseCase.findFollowee(res, findUser, req.session.user.id);
        //もしすでにフォローしている（true）なら、フォローをはずす。falseならフォローをつける
        if (alwaysFollow) {
            await userUseCase.detachFollow(res, followId, req.session.user.id);
        } else {
            await userUseCase.attachFollow(res, followId, req.session.user.id)
        }
        res.redirect('/user/'+ followId)
    },
    search: async(req, res, next) => {
        const users = await userUseCase.userGetAll();
        let friends = []
        
        for (let i = 0 ; i < users.length ; i++) {
            //ログインユーザー以外の全ての友達
            if (users[i].id != req.session.user.id) {
                friends.push(users[i])
                
            }
        }

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

        const data = {
            title: 'Search',
            login: req.session.user,
            users: {
                friends: friends,
                isFollow: isFollow
            }
        }
        res.render("layout", { layout_name: 'search', data} );
    },



}