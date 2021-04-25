"use strict";

const User = require("../models/user")
const jsonWebToken = require('jsonwebtoken')
const db = require('../models/index')
const httpStatus = require('http-status');
const process = require('../config/process.js');
const multer = require('multer')
const userUseCase = require('../usecase/users')

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
        res.render('layout', { layout_name: 'login', title: 'login' });
    },
    register: async(req, res, next) => {
        res.render('layout', { layout_name: 'Register', title: 'Register' });
    },
    index: async(req, res, next) => {
        const users = await userUseCase.userGetAll();
        res.locals.users = users;
        next();
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
        await userUseCase.userDelete(req.body.id);
        res.redirect('/');
    },
    apiAuthenticate: async(req, res, next) => {
        const user = userUseCase.findForPayload(req.body);
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
        const UserId = req.session.user.id;
        const oneUser = await userUseCase.findOneUser(res, UserId);
        //取得したuser情報をもとに画面にレンダリング
        const data = {
            title: 'マイプロフィール',
            user: oneUser,
            err: null
        }
        res.render('layout', { layout_name: 'myprof', data });
    },
    imageUpload: async(req, res, next) => {
        await userUseCase.userImageUpload(res, req.session.user)
        res.redirect('/user/' + req.session.user.id)
    }
}