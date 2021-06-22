"use strict";

const User = require("../models/user")
const Event = require("../models/event")
const Join = require("../models/join")
const Tag = require("../models/tag")
const EventTag = require("../models/eventtag")
const EventDate = require("../models/eventDate")
const eventTime = require("../models/eventTime")
const jsonWebToken = require('jsonwebtoken')
const db = require('../models/index')
const httpStatus = require('http-status');
const process = require('../config/process.js');
const moment = require('moment')
const eventUseCase = require('../usecase/events')
const tagUseCase = require('../usecase/tags')
const userUseCase = require('../usecase/users')
const joinUseCase = require('../usecase/joins')
const favoriteUseCase = require('../usecase/favorite')

module.exports = {
    index: async(req, res, next) => {
        //イベント開催日とイベント情報取得
        const allEventDate = await eventUseCase.getEventDateAll();
        const allEventInfo = await eventUseCase.getEventDataOrderByHoldTime(res, allEventDate);
        
        //全イベント情報取得
        const eventAllData = await eventUseCase.eventGetAll();
        //全タグ情報取得
        const tagAllData = await tagUseCase.tagGetAll();
       
        //お気に入りが数多く付けられている順番でイベントのidを取得する。
        let mostFavoriteEventId = await eventUseCase.eachEventFavoriteLength(res, eventAllData)
        
        const mostFavoriteEvent = await eventUseCase.findOneEvent(mostFavoriteEventId[0]);
        const secondlyFavoriteEvent = await eventUseCase.findOneEvent(mostFavoriteEventId[1]);
        
        const data = {
            title: 'Event',
            login: req.session.user,
            contents: allEventInfo,
            eventDate: allEventInfo.eventDate,
            Tags: tagAllData,
            maxFavoriteEvent: mostFavoriteEvent,
            secondFavoriteEvent: secondlyFavoriteEvent,
        }
        res.render('layout', { layout_name: 'events/dateTimeList', data });
        
    },
    search: async(req, res, next) => {
        const TagName = req.params.TagName;
        const eventAllData = await eventUseCase.eventGetAll();
        let searchEventResult = [];
        let holdDate = [];
        //各イベントそれぞれの
        eventAllData.forEach((event) => {
            //各タグのそれぞれが
            event.Tag.forEach((eventtags) => {
                //各イベントについているタグのいずれかが、探したいタグと一致していれば
                if (eventtags.name == TagName) {
                    searchEventResult.push(event)
                    //開催日取得
                    holdDate.push(event.EventDate);
                }
            })
        });
        const tagAllData = await tagUseCase.tagGetAll();
        const data = {
            title: TagName,
            login: req.session.user,
            content: {
                event: searchEventResult,
                holdDate: holdDate,
            },
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

        let holdDate = [];
        let eventHistoryList = [];
        let history = oneUser.Event;

        for (let i = 0 ; i < history.length ; i++) {
            const oneEvent = await eventUseCase.findOneEvent(history[i].id)
            //開催日時情報
            holdDate.push(oneEvent.EventDate); 
            eventHistoryList[i] = oneEvent
        }

        const data = {
            title: 'History',
            login: req.session.user,
            content: {
                event: eventHistoryList,
                holdDate: holdDate,
            },
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
        const newEventData = await eventUseCase.eventCreate(res, req.session.user.id, req.body);
        req.session.newEvent = newEventData.id
        //タグ作成およびイベントとの紐付け
        if (req.body.tags == "") {
            next()
        }
        let tags = JSON.parse(req.body.tags);
        //tagの数だけ繰り返す
        tags.forEach(async function(tag, key ) {
            //入力したタグをDBから探し、なければ作成する。
            let findTag = await tagUseCase.findOrCreate(res, tag);
            //タグをイベントと紐付け
            tagUseCase.eventTagCreate(res, newEventData, findTag);
            next()
        });
    },
    edit: async(req, res, next) => {
        const EventId = req.params.id;
        const oneEvent = await eventUseCase.findOneEvent(EventId);
        const holdDate = await eventUseCase.getFomatedDate(res, oneEvent.EventDate, oneEvent.EventTime);

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
        req.session.updateEventId = EventId;
        //イベント情報のアップデート
        await eventUseCase.eventUpdate(res, EventId, req.body);
        next();
    },
    tagUpdate: async(req, res, next) => {
        const EventId = req.params.id;
        const discoveredEvent = await eventUseCase.findOneEvent(EventId);
        //古いイベントタグ紐付け情報をいったん消す
        await tagUseCase.eventTagDestroy(res, EventId);
        //タグ作成およびイベントとの紐付け
        if (!req.body.tags) {
            next()
        }
        let tags = JSON.parse(req.body.tags);
        //tagの数だけ繰り返す
        tags.forEach(async function(tag, key ) {
            //入力したタグをDBから探し、なければ作成する。
            let discoveredTag = await tagUseCase.findOrCreate(res, tag);
            //タグをイベントと紐付け
            tagUseCase.eventTagCreate(res, discoveredEvent, discoveredTag);
        });
        next()
    },
    show: async(req, res, next) => {
        const EventId = req.params.id;
        const oneEvent = await eventUseCase.findOneEvent(EventId);
        let isJoining = false;
        let isFavorite = false;
        const joininigUsers = oneEvent.User;
        const favoriteLength = oneEvent.UserFavorite;
        req.session.eventId = EventId

        //あなたはそのイベントに参加予定か？
        joininigUsers.forEach(element => {
            if (element.id == req.session.user.id) {
                isJoining = true;
            }
        });
        //あなたはそのイベントをお気に入り登録しているか
        favoriteLength.forEach(element => {
            if (element.id == req.session.user.id) {
                isFavorite = true;
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
            isJoin: isJoining,
            isFavorite: isFavorite,
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
        const userId = req.session.user.id
        const eventId = req.session.eventId;
        //参加しているかを判定する。
        const joiningData = await joinUseCase.findOne(userId, eventId);
        //参加表明と参加辞退を切り替える
        joiningData ? await joinUseCase.exit(req, res, userId, eventId) : await joinUseCase.entry(req, res, userId, eventId)

        res.redirect('/events/show/'+ eventId);
    },
    favorite: async(req, res, next) => {
        //お気に入りかを判定する。
        const favoriteData = await favoriteUseCase.findOne(req.body);
        //参加表明と参加辞退を切り替える
        favoriteData ? await favoriteUseCase.exit(res, req.body) : await favoriteUseCase.entry(res, req.body)

        res.redirect('/events/show/' + req.body.eventId);
    },
    FavoriteList: async(req, res, next) => {
        //userIdを引き取る
        const userId = req.session.user.id;
        const oneUser = await userUseCase.findOneUser(res, userId);
        //全タグ情報取得
        const tagAllData = await tagUseCase.tagGetAll();

        let FavoritedEventList = [];
        let holdDate = [];
        let FavoriteList = oneUser.FavoriteEvent;
        
        for (let i = 0 ; i < FavoriteList.length ; i++) {
            let event = await eventUseCase.findOneEvent(FavoriteList[i].id)
            FavoritedEventList[i] = event
            //開催日時情報
            holdDate.push(event.EventDate); 
        }
        
        const data = {
            title: 'Favorite',
            login: req.session.user,
            content: {
                event: FavoritedEventList,
                holdDate: holdDate,
            },
            Tags: tagAllData,
        }
        res.render('layout', { layout_name: 'events/FavoriteList', data });

    },
    imageRegister: async(req, res, next) => {
        const newEventId = req.session.newEvent
        await eventUseCase.fileCreateToS3(req, res, next, newEventId);

        req.session.newEvent = null;
        res.redirect('/events');
    },
    imageUpload: async(req, res, next) => {
        const updateEventId = req.session.updateEventId
        await eventUseCase.fileUploadToS3(req, res, next, updateEventId);
        req.session.updateEventId = null;
        res.redirect('/events');
    },
    participationPayment: async(req, res, next) => {
        const EventId = req.params.id;
        const oneEvent = await eventUseCase.findOneEvent(EventId);
        let isJoining = false;
        let isFavorite = false;
        const joiningUser = oneEvent.User;
        const favoriteUser = oneEvent.UserFavorite;
        req.session.eventId = EventId

        //あなたはそのイベントに参加予定か？
        joiningUser.forEach(element => {
            if (element.id == req.session.user.id) {
                isJoining = true;
            }
        });
        //あなたはそのイベントをお気に入り登録しているか
        favoriteUser.forEach(element => {
            if (element.id == req.session.user.id) {
                isFavorite = true;
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
            isJoin: isJoining,
            isFavorite: isFavorite,
            writter: writter,
            err: null,
            holdDate: holdDate,
        }
        res.render('layout', { layout_name: 'events/payment', data });
    },
    pay: async(req, res, next) => {
        const response = await eventUseCase.payEventPrice(req, res);
        res.send(response);
    },

}

  
