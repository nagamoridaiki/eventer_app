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

module.exports = {
    findOneUser: async function (res, userId) {
        const oneUser = await db.User.findOne({
            where: {
                id: userId
            },
            include: ['Event', 'FavoriteEvent'],
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
        const allUsers = await db.User.findAll()
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
    userImageUpload: async function (res, params) {
        const newUser = await db.User.update({
            image: params.id + params.name + ".jpg",
        }, {
            where: { id: params.id, }
        }).catch(err => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        });
        return newUser;
    },
    userUpdate: async function (res, params) {
        const updatedUser = await db.User.update({
            name: params.name,
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


}