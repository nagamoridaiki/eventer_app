"use strict";

const User = require("../models/user")
const Event = require("../models/event")
const Join = require("../models/join")
const Favorite = require("../models/favorite")
const Tag = require("../models/tag")
const EventTag = require("../models/eventtag")
const jsonWebToken = require('jsonwebtoken')
const db = require('../models/index')
const httpStatus = require('http-status');
const process = require('../config/process.js');
const moment = require('moment')

module.exports = {
    findOne: async function (params) {
        const favoriteData = await db.Favorite.findOne({
            where: {
                userId: params.userId,
                eventId: params.eventId,
            }
        });
        return favoriteData;
    },
    //イベントを削除する際に、参加者情報も全削除する。
    destroy: async function (EventId) {
        await db.Favorite.destroy({
            where: { eventId: EventId }
        }).catch((err) => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        });
    },
    //参加をやめる
    exit: async function (res, params) {
        await db.Favorite.destroy({
            where: {
                userId: params.userId,
                eventId: params.eventId,
            }
        }).catch((err) => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        });
    },
    //参加表明する
    entry: async function (res, params) {
        //res.json(params)
        await db.Favorite.create({
            userId: params.userId,
            eventId: params.eventId,
        }).catch((err) => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        });
    },
}