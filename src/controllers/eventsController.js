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
    index: async(req, res, next) => {
        //全イベント情報取得
        const eventAllData = await eventUseCase.eventGetAll();
        //全タグ情報取得
        const tagAllData = await tagUseCase.tagGetAll();

        const data = {
            title: 'Event',
            login: req.session.user,
            content: eventAllData,
            Tags: tagAllData,
        }
        res.render('layout', { layout_name: 'events/list2', data });

    },
    search: async(req, res, next) => {
        const TagName = req.params.TagName;
        const eventAllData = await eventUseCase.eventGetAll();
        let serchResultEvent = [];
        //各イベントそれぞれの
        eventAllData.forEach((event) => {
            //各タグのそれぞれが
            event.Tag.forEach((eventtags) => {
                //各イベントについているタグのいずれかが、探したいタグと一致していれば
                if (eventtags.name == TagName) {
                    serchResultEvent.push(event)
                }
            })
        });
        const tagAllData = await tagUseCase.tagGetAll();
        const data = {
            title: '検索結果',
            login: req.session.user,
            content: serchResultEvent,
            Tags: tagAllData,
        }
        res.render('layout', { layout_name: 'events/search', data });             
    },
    history: async(req, res, next) => {
        //userIdを引き取る
        const userId = req.session.user.id;
        const oneUser = await userUseCase.findOneUser(res, userId);
        //全タグ情報取得
        const tagAllData = await tagUseCase.tagGetAll();

        const data = {
            title: 'History',
            login: req.session.user,
            content: oneUser.Event,
            Tags: tagAllData,
        }
        res.render('layout', { layout_name: 'events/history', data });

    },
    add: (req, res, next) => {
        const data = {
            title: 'Events/Add',
            login: req.session.user,
            err: null
        }
        res.render('layout', { layout_name: 'events/add', data });
    },
    create: async(req, res, next) => {
        //イベント作成
        const newEventData = await eventUseCase.eventCreate(req.session.user.id, req.body);
        //タグ作成およびイベントとの紐付け
        let tags = JSON.parse(req.body.tags);
        //tagの数だけ繰り返す
        tags.forEach(async function(tag, key ) {
            //入力したタグをDBから探し、なければ作成する。
            let findTag = await tagUseCase.findOrCreate(res, tag);
            //タグをイベントと紐付け
            tagUseCase.eventTagCreate(res, newEventData, findTag);
            res.redirect('/events');
        });
    },
    edit: async(req, res, next) => {
        const EventId = req.params.id;
        const oneEvent = await eventUseCase.findOneEvent(EventId);
        const holdDate = await eventUseCase.getHoldDate(oneEvent);

        const data = {
            title: 'Event/Edit',
            login: req.session.user,
            event: oneEvent,
            err: null,
            holdDate: holdDate,
        }
        res.render('layout', { layout_name: 'events/edit', data });

    },
    update: async(req, res, next) => {
        const EventId = req.params.id;
        //イベント情報のアップデート
        await eventUseCase.eventUpdate(EventId, req.body);
        next();
    },
    tagUpdate: async(req, res, next) => {
        const EventId = req.params.id;
        const findEvent = await eventUseCase.findOneEvent(EventId);
        //古いイベントタグ紐付け情報をいったん消す
        await tagUseCase.eventTagDestroy(res, EventId);
        //タグ作成およびイベントとの紐付け
        let tags = JSON.parse(req.body.tags);
        //tagの数だけ繰り返す
        tags.forEach(async function(tag, key ) {
            //入力したタグをDBから探し、なければ作成する。
            let findTag = await tagUseCase.findOrCreate(res, tag);
            //タグをイベントと紐付け
            tagUseCase.eventTagCreate(res, findEvent, findTag);
            res.redirect('/events');
        });
    },
    show: async(req, res, next) => {
        const EventId = req.params.id;
        const oneEvent = await eventUseCase.findOneEvent(EventId);
        let isJoin = false;
        const joinUser = oneEvent.User;

        //あなたはそのイベントに参加予定か？
        joinUser.forEach(element => {
            if (element.id == req.session.user.id) {
                isJoin = true;
            }
        });
        //イベントの投稿者
        const writter = await userUseCase.findOneUser(res, oneEvent.userId);
        //開催日時情報
        const holdDate = await eventUseCase.getHoldDate(oneEvent);

        const data = {
            title: 'events/show',
            login: req.session.user,
            event: oneEvent,
            isJoin: isJoin,
            writter: writter,
            err: null,
            holdDate: holdDate,
        }
        res.render('layout', { layout_name: 'events/show', data });
    },
    delete: async(req, res, next) => {
        const deletedEventId = await eventUseCase.eventDelete(req.params.id);
        //イベントタグ情報を消す
        await tagUseCase.eventTagDestroy(res, deletedEventId);
        //参加状況を消す
        await joinUseCase.destroy(deletedEventId);
        res.redirect('/events');
    },
    join: async(req, res, next) => {
        //参加しているかを判定する。
        const joinData = await joinUseCase.findOne(req.body);
        //参加表明と参加辞退を切り替える
        joinData ? await joinUseCase.exit(res, req.body) : await joinUseCase.entry(res, req.body)

        res.redirect('/events');
    }
}
