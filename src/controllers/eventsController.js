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
    index: async(req, res, next) => {
        db.Event.findAll({
                include: ['User', 'Tag'],
                order: [
                    ['id', 'DESC']
                ],
            })
            .then(async(event) => {
                const Tags = await db.Tag.findAll().catch((err) => {
                    res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
                });
                const data = {
                    title: 'Event',
                    login: req.session.user,
                    content: event,
                    Tags: Tags,
                }
                res.render('layout', { layout_name: 'events/list2', data });
            });
    },
    search: async(req, res, next) => {
        const TagName = req.params.TagName;
        db.Event.findAll({
                include: ['User', 'Tag'],
                order: [
                    ['id', 'DESC']
                ],
            })
            .then(async(eventList) => {
                let serchResultEvent = [];
                //各イベントそれぞれの
                eventList.forEach((event) => {
                    //各タグのそれぞれが
                    event.Tag.forEach((eventtags) => {
                        //各イベントについているタグのいずれかが、探したいタグと一致していれば
                        if (eventtags.name == TagName) {
                            serchResultEvent.push(event)
                        }
                    })
                });
                const Tags = await db.Tag.findAll().catch((err) => {
                    res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
                });
                const data = {
                    title: '検索結果',
                    login: req.session.user,
                    content: serchResultEvent,
                    Tags: Tags,
                }
                res.render('layout', { layout_name: 'events/search', data });                
            });
    },
    history: async(req, res, next) => {
        //userIdを引き取る
        const UserId = req.session.user.id;
        await db.User.findOne({
            where: {
                id: UserId
            },
            include: ['Event'],
        }).then(async(user) => {
            const Tags = await db.Tag.findAll().catch((err) => {
                res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
            });
            const data = {
                title: 'History',
                login: req.session.user,
                content: user.Event,
                Tags: Tags,
            }
            res.render('layout', { layout_name: 'events/history', data });
        })
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
        const newEvent = await db.Event.create({
                    userId: req.session.user.id,
                    title: req.body.title,
                    subTitle: req.body.subTitle,
                    detail: req.body.detail,
                    holdDate: req.body.holdDate,
                    capacity: req.body.capacity,
                    image: req.session.user.id + req.session.user.name + "event.jpg",
                }).catch((err) => {
                        const data = {
                            title: 'events',
                            login: req.session.user,
                            err: err,
                        }
                        res.render('layout', { layout_name: 'events/add', data });
                });
        //タグ作成およびイベントとの紐付け
        let tags = JSON.parse(req.body.tags);
        //tagの数だけ繰り返す
        tags.forEach(async function(tag, key ) {
            let findTag = await db.Tag.findOrCreate({
                where: { name: tag.value }
            }).catch((err) => {
                res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
            })
            //イベントとの紐付け
            db.EventTag.create({
                eventId: newEvent.id,
                tagId: findTag[0].id,
            }).then(() => {
                res.redirect('/events');
            }).catch((err) => {
                res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
            })
        })
    },
    edit: async(req, res, next) => {
        const EventId = req.params.id;
        await db.Event.findOne({
            where: {
                id: EventId,
            },
            include: ['User', 'Tag'],
        }).then(event => {
            const holdDateYear = moment(event.holdDate).format('Y');
            const holdDateMonth = moment(event.holdDate).format('M');
            const holdDateDate = moment(event.holdDate).format('D');
            const holdDateTime = moment(event.holdDate).format('HH:mm');

            const data = {
                title: 'Event/Edit',
                login: req.session.user,
                event: event,
                err: null,
                holdDateYear: holdDateYear,
                holdDateMonth: holdDateMonth,
                holdDateDate: holdDateDate,
                holdDateTime: holdDateTime,
            }
            res.render('layout', { layout_name: 'events/edit', data });
        });
    },
    update: async(req, res, next) => {
        const EventId = req.params.id;

        await db.Event.update({
            title: req.body.title,
            subTitle: req.body.subTitle,
            detail: req.body.detail,
            holdDate: req.body.holdDate,
            capacity: req.body.capacity,
        }, {
            where: { id: EventId, }
        }).catch((err) => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: '編集に失敗しました。' });
            res.sendStatus(500)
        })
        next();
    },
    tagUpdate: async(req, res, next) => {
        const EventId = req.params.id;
        const findEvent = await db.Event.findOne({
            where: {
                id: EventId,
            },
            include: ['User', 'Tag'],
        });
        await db.EventTag.destroy({
            where: { eventId: EventId }
        });
        //タグ作成およびイベントとの紐付け
        let tags = JSON.parse(req.body.tags);
        //tagの数だけ繰り返す
        tags.forEach(async function(tag, key ) {
            let findTag = await db.Tag.findOrCreate({
                where: { name: tag.value }
            }).catch((err) => {
                res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
            })
            //イベントとの紐付け
            db.EventTag.create({
                eventId: findEvent.id,
                tagId: findTag[0].id,
            }).catch((err) => {
                res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
            })
        });
        res.redirect('/events');
    },
    show: async(req, res, next) => {
        const EventId = req.params.id;
        await db.Event.findOne({
            where: {
                id: EventId,
            },
            include: ['User', 'Tag'],
            
        }).then(async(event) => {
            let isJoin = false;
            const joinUser = event.User;
            //あなたはそのイベントに参加予定か？
            joinUser.forEach(element => {
                if (element.id == req.session.user.id) {
                    isJoin = true;
                }
            });
            //イベントの投稿者
            const writter = await db.User.findOne({
                where: {
                    id: event.userId,
                }
            });
            const holdDateYear = moment(event.holdDate).format('Y');
            const holdDateMonth = moment(event.holdDate).format('M');
            const holdDateDate = moment(event.holdDate).format('D');
            const holdDateTime = moment(event.holdDate).format('HH:mm');

            const data = {
                title: 'events/show',
                login: req.session.user,
                event: event,
                isJoin: isJoin,
                writter: writter,
                err: null,
                holdDateYear: holdDateYear,
                holdDateMonth: holdDateMonth,
                holdDateDate: holdDateDate,
                holdDateTime: holdDateTime,
            }
            res.render('layout', { layout_name: 'events/show', data });
        });

    },
    delete: async(req, res, next) => {
        db.sequelize.sync()
            .then(async() => {
                const event_id = req.params.id;
                await db.Event.destroy({
                    where: { id: event_id }
                })
                return event_id;
            }).then(async(event_id) => {
                //イベント削除時に紐づいているタグと参加者情報の削除
                await db.EventTag.destroy({
                    where: { eventId: event_id }
                })
                await db.Join.destroy({
                    where: { eventId: event_id }
                })
                return event_id;
            }).then(() => {
                res.redirect('/events');
            }).catch((err) => {
                res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
            });
    },
    join: async(req, res, next) => {
        //いいねがついているかを判定する。
        const form = {
            userId: req.body.userId,
            eventId: req.body.eventId,
        };
        const join = await db.Join.findOne({
            where: form
        })
        if (join) {
            //既にいいねがついている場合、いいねを外す。
            await db.Join.destroy({
                    where: form
                })
                .then(() => {
                    res.redirect('/events');
                })
                .catch((err) => {
                    res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
                });
        } else {
            //いいねがついていない場合、いいねをつける。
            await db.Join.create(form)
                .then(() => {
                    res.redirect('/events');
                })
                .catch((err) => {
                    res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
                });
        }
    }


}