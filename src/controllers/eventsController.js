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
const favoriteUseCase = require('../usecase/favorite')

const env = require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")("sk_test_XXXXXXXXXXX");


module.exports = {
    index: async(req, res, next) => {
        //全イベント情報取得
        const eventAllData = await eventUseCase.eventGetAll();
        //全タグ情報取得
        const tagAllData = await tagUseCase.tagGetAll();
        //res.json(eventAllData)
        const sort_target = 'holdDate';
        eventAllData.sort((a, b) => a[sort_target] - b[sort_target]);

        let holdDate = [];
        eventAllData.forEach(function(oneEventData) {
            //開催日時情報
            holdDate.push(eventUseCase.getHoldDate(oneEventData));
        });

        //日付ごとのイベント並び替え
        let sortedEventByDateTime = eventUseCase.orderByDateTime(req, res, eventAllData, holdDate)

        //お気に入りが数多く付けられている順番でイベントのidを取得する。
        let maxFavoriteEventId = await eventUseCase.eachEventFavoriteLength(res, eventAllData)
        
        const mostFavoriteEvent = await eventUseCase.findOneEvent(maxFavoriteEventId[0]);
        const secondFavoriteEvent = await eventUseCase.findOneEvent(maxFavoriteEventId[1]);
        
        const data = {
            title: 'Event',
            login: req.session.user,
            holdDate: holdDate,
            displayEventData: sortedEventByDateTime.EventData,
            dateTimeList: sortedEventByDateTime.dateTime,
            Tags: tagAllData,
            maxFavoriteEvent: mostFavoriteEvent,
            secondFavoriteEvent: secondFavoriteEvent,
        }
        res.render('layout', { layout_name: 'events/dateTimeList', data });
        
    },
    search: async(req, res, next) => {
        const TagName = req.params.TagName;
        const eventAllData = await eventUseCase.eventGetAll();
        let serchResultEvent = [];
        let holdDate = [];
        //各イベントそれぞれの
        eventAllData.forEach((event) => {
            //開催日取得
            holdDate.push(eventUseCase.getHoldDate(event));
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
            title: TagName,
            login: req.session.user,
            content: {
                event: serchResultEvent,
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
        let historyEventList = [];
        let history = oneUser.Event;

        for (let i = 0 ; i < history.length ; i++) {
            //開催日時情報
            holdDate.push(eventUseCase.getHoldDate(history[i])); 
            let event = await eventUseCase.findOneEvent(history[i].id)
            historyEventList[i] = event
        }

        const data = {
            title: 'History',
            login: req.session.user,
            content: {
                event: historyEventList,
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
        const newEventData = await eventUseCase.eventCreate(req.session.user.id, req.body);
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
        req.session.updateEventId = EventId;
        //イベント情報のアップデート
        await eventUseCase.eventUpdate(res, EventId, req.body);
        next();
    },
    tagUpdate: async(req, res, next) => {
        const EventId = req.params.id;
        const findEvent = await eventUseCase.findOneEvent(EventId);
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
            let findTag = await tagUseCase.findOrCreate(res, tag);
            //タグをイベントと紐付け
            tagUseCase.eventTagCreate(res, findEvent, findTag);
        });
        next()
    },
    show: async(req, res, next) => {
        const EventId = req.params.id;
        const oneEvent = await eventUseCase.findOneEvent(EventId);
        let isJoin = false;
        let isFavorite = false;
        const joinUser = oneEvent.User;
        const favoriteUser = oneEvent.UserFavorite;

        //あなたはそのイベントに参加予定か？
        joinUser.forEach(element => {
            if (element.id == req.session.user.id) {
                isJoin = true;
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
            isJoin: isJoin,
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
        //参加しているかを判定する。
        const joinData = await joinUseCase.findOne(req.body);
        //参加表明と参加辞退を切り替える
        joinData ? await joinUseCase.exit(res, req.body) : await joinUseCase.entry(res, req.body)

        res.redirect('/events');
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
            //開催日時情報
            holdDate.push(eventUseCase.getHoldDate(FavoriteList[i])); 
            let event = await eventUseCase.findOneEvent(FavoriteList[i].id)
            FavoritedEventList[i] = event
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
    joinPayment: async(req, res, next) => {
        const EventId = req.params.id;
        const oneEvent = await eventUseCase.findOneEvent(EventId);
        let isJoin = false;
        let isFavorite = false;
        const joinUser = oneEvent.User;
        const favoriteUser = oneEvent.UserFavorite;

        //あなたはそのイベントに参加予定か？
        joinUser.forEach(element => {
            if (element.id == req.session.user.id) {
                isJoin = true;
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
            isJoin: isJoin,
            isFavorite: isFavorite,
            writter: writter,
            err: null,
            holdDate: holdDate,
        }
        res.render('layout', { layout_name: 'events/payment', data });
    },
    pay: async(req, res, next) => {

        const { paymentMethodId, paymentIntentId, items, currency, useStripeSdk } = req.body;
      
        const total = calculateAmount(req.body.items);
      
        try {
          let intent;
          if (paymentMethodId) {
              const request = {
                  amount: total,
                  currency: currency,
                  payment_method: paymentMethodId,
                  confirmation_method: "manual",
                  confirm: true,
                  use_stripe_sdk: useStripeSdk,
              }
      
            intent = await stripe.paymentIntents.create(request);
            
          } else if (paymentIntentId) {
              intent = await stripe.paymentIntents.confirm(paymentIntentId);
          }
      
          const response = generateResponse(intent);
            
          res.send(response);
      
        } catch (e) {
          const response = generateErrorResponse(e.message);
      
          res.status(500);
          res.send(response);
        }
    },

}

function calculateAmount(items) {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
        const current = items[i].amount * items[i].quantity;
        total += current;
    }
  
    return total;
  }
  
  function generateResponse(paymentIntent) {
    let response = {
        requiresAction: false,
        clientSecret: "",
        paymentIntentStatus : ""
    }
  
    switch (paymentIntent.status) {
        case "requires_action":
            response.paymentIntentStatus = "requires_action";
            break;
        case "requires_source_action":
            response.paymentIntentStatus = "requires_source_action";
            response.requiresAction = true;
            response.clientSecret = paymentIntent.client_secret;
            break;
        case "requires_payment_method":
            response.paymentIntentStatus = "requires_payment_method";
            break;
        case "requires_source":
            response.paymentIntentStatus = "requires_source";
            response.error = {
                messages : ["カードが拒否されました。別の決済手段をお試しください"]
            }
            break;
        case "succeeded":
            response.paymentIntentStatus = "succeeded";
            response.clientSecret = paymentIntent.client_secret;
            break;
        default:
            response.error = {
                messages : ["システムエラーが発生しました"]
            }
            break;
    }
    return response;
  }
  
function generateErrorResponse (error) {
    return {
        error : {
        messages : [error]
        }
    }
}
  
