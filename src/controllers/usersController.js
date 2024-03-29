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
        res.render('layout', { layout_name: 'register', title: 'Register', data });
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
        const token = jsonWebToken.sign(payload, 'secret');
        req.session.token = token;
        req.session.user = newUser;
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
        }).then(user => {
            if (user != null) {
                const payload = {
                    id: user.id,
                    email: user.email,
                    password: user.password
                }
                const token = jsonWebToken.sign(payload, process['JWT_SECRET']);
                req.session.token = token;
                req.session.user = user;
                next()
            } else {
                res.render('layout', { layout_name: 'error', title: 'ERROR', msg: 'ユーザーが見つかりませんでした。' });
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
        let followUserFlg = await userUseCase.discoveredFollowee(res, oneUser, req.session.user.id);
        //そのユーザーとのDM履歴取得
        let messagesList = await userUseCase.getAllMessages(res, UserId, req.session.user.id);
        
        //取得したuser情報をもとに画面にレンダリング
        const data = {
            title: 'マイプロフィール',
            user: oneUser,
            followUserFlg: followUserFlg,
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
        await userUseCase.userUpdate(res, req.body);
        //取得したuser情報をもとに画面にレンダリング
        next();
    },
    imageUpload: async(req, res, next) => {
        await userUseCase.fileUploadToS3(req, res, next);
        
        res.redirect('/user/' + req.session.user.id)
    },
    follow: async(req, res, next) => {
        const followId = req.params.id;
        const targetUser = await userUseCase.findOneUser(res, followId);
        //ログインユーザーがそのユーザーをフォローしているか
        let followUserFlg = await userUseCase.discoveredFollowee(res, targetUser, req.session.user.id);
        //もしすでにフォローしている（true）なら、フォローをはずす。falseならフォローをつける
        if (followUserFlg) {
            await userUseCase.detachFollow(res, followId, req.session.user.id);
        } else {
            await userUseCase.attachFollow(res, followId, req.session.user.id)
        }
        res.redirect('/user/'+ followId)
    },
    search: async(req, res, next) => {
        const users = await userUseCase.userGetAll();
        //ログインユーザー以外のユーザーを全て取得
        let otherUsers = await userUseCase.getOthersUsers(req, users);
        //そのユーザーひとりずつに対してフォローしているか
        let followUserFlg = await userUseCase.isYourFollow(req, otherUsers);

        const data = {
            title: 'Search',
            login: req.session.user,
            users: {
                otherUsers: otherUsers,
                followUserFlg: followUserFlg
            }
        }
        res.render("layout", { layout_name: 'search', data} );
    },
    searchUser: async(req, res, next) => {
        //検索バーに入力した文字を名前に含むユーザー
        const users = await userUseCase.searchUserByName(req, res);
        //ログインユーザー以外のユーザーを全て取得
        let otherUsers = await userUseCase.getOthersUsers(req, users);
        //そのユーザーひとりずつに対してフォローしているか
        let followUserFlg = await userUseCase.isYourFollow(req, otherUsers);

        const data = {
            title: 'Search',
            login: req.session.user,
            users: {
                otherUsers: otherUsers,
                followUserFlg: followUserFlg
            }
        }
        res.render("layout", { layout_name: 'search', data} );

    }



}