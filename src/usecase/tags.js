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
        //全てのイベントに付いているタグを取得
        const allEventTags = await db.EventTag.findAll(
            {attributes: ['tagId']}
        );

        //イベントそれぞれのタグ情報を全て取得（重複あり）
        let valiedTags = []
        for (let i = 0 ; i < allEventTags.length ; i++) {
            valiedTags[i] = await db.Tag.findOne(
                { where: {
                    id: allEventTags[i].tagId
                  }
                }
            )
        }
        //重複するタグは削除
        const notDuplicatedValiedTags = 
        valiedTags.filter((element, index, self) => 
            self.findIndex(e => 
                e.id === element.id &&
                e.name === element.name
            ) === index
        );

        return notDuplicatedValiedTags;
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