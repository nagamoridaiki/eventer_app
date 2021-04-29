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
    eventGetAll: async function () {
        const allEvent = await db.Event.findAll({
            include: ['User', 'Tag', 'UserFavorite'],
            order: [
                ['id', 'DESC']
            ],
        })
        return allEvent;
    },
    findOneEvent: async function (EventId) {
        const oneEvent = await db.Event.findOne({
            where: {
                id: EventId,
            },
            include: ['User', 'Tag', 'UserFavorite'],
        })
        return oneEvent
    },
    eventCreate: async function (EventId, params) {
        const newEvent = await db.Event.create({
            userId: EventId,
            title: params.title,
            subTitle: params.subTitle,
            detail: params.detail,
            holdDate: params.holdDate,
            capacity: params.capacity,
            image: EventId + "event.jpg",
        }).catch((err) => {
            return err
        });
        return newEvent;
    },
    eventUpdate: async function (EventId, params){
        await db.Event.update({
            title: params.title,
            subTitle: params.subTitle,
            detail: params.detail,
            holdDate: params.holdDate,
            capacity: params.capacity,
        }, {
            where: { id: EventId, }
        }).catch((err) => {
            return err
        });
        return true;
    },
    eventDelete: async function (EventId){
        await db.Event.destroy({
            where: { id: EventId }
        })
        return EventId;
    },
    //開催日時情報の取得
    getHoldDate: function (oneEvent){
        const Year = moment(oneEvent.holdDate).format('Y');
        const Month = moment(oneEvent.holdDate).format('M');
        const Date = moment(oneEvent.holdDate).format('D');
        const Time = moment(oneEvent.holdDate).format('HH:mm');
        const holdDate = {
            Year: Year,
            Month: Month,
            Date: Date,
            Time: Time
        };
        return holdDate;
    },
    getFavoriteLength: function (oneEvent){
        let FavoriteLength = oneEvent.UserFavorite.length;
        return FavoriteLength;
    },
    //お気に入りが一番ついているイベントのidを取得する。
    getMaxFavarite: function (allEventId, favoriteLengthList){
        let FavoriteCount = 0
        let maxEventId
        for( let i = 0; i < allEventId.length; i++ ) {
            //一番大きい要素のみが最後にFavoriteCountに渡されるようにする。
            let oneEventId = allEventId[i]
            if (i == 0) {
                maxEventId = oneEventId;
            }
            if (FavoriteCount < favoriteLengthList[oneEventId]){
                FavoriteCount = favoriteLengthList[oneEventId]
                maxEventId = oneEventId
            }
        }
        return maxEventId
    }
}