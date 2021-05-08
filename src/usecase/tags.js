"use strict";

const User = require("../models/user")
const Event = require("../models/event")
const Article = require("../models/article")
const Join = require("../models/join")
const Tag = require("../models/tag")
const EventTag = require("../models/eventtag")
const jsonWebToken = require('jsonwebtoken')
const db = require('../models/index')
const httpStatus = require('http-status');
const process = require('../config/process.js');
const moment = require('moment')

module.exports = {
    tagGetAll: async function () {
        const allTags = await db.Tag.findAll();
        return allTags;
    },
    findOrCreate: async function (res, tag) {
        let findTag = await db.Tag.findOrCreate({
            where: { name: tag.value }
        }).catch((err) => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        })
        return findTag
    },
    eventTagCreate: async function (res, newEventData, tag) {
        //イベントとの紐付け
        await db.EventTag.create({
            eventId: newEventData.id,
            tagId: tag[0].id,
        }).catch((err) => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        })
    },
    eventTagDestroy: async function (res, EventId) {
        //イベントとの紐付け
        await db.EventTag.destroy({
            where: { eventId: EventId }
        }).catch((err) => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        })
    },
}