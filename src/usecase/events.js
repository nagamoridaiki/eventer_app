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
const path = require('path');
const sharp = require('sharp');

const AWS = require('aws-sdk');
var awsCredFile = path.join(__dirname, '../config/AwsConfig.json');
AWS.config.loadFromPath(awsCredFile);

const env = require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")("sk_test_XXXXXXXXXXX");

module.exports = {
    eventGetAll: async function () {
        const allEvent = await db.Event.findAll({
            include: ['User', 'Tag', 'UserFavorite','EventDate', 'EventTime'],
            order: [
                ['id', 'DESC']
            ],
        })
        return allEvent;
    },
    getEventDateAll: async function () {
        const allEventDate = await db.EventDate.findAll({
            include: ['Event'],
            order: [
                ['id', 'DESC']
            ],
        })
        return allEventDate;
    },
    getEventDataOrderByHoldTime: async function (res, allEventDate) {
        let eventDate = []
        let event = []
        for (let i = 0 ; i < allEventDate.length ; i++) {
            eventDate[i] = allEventDate[i]
            let eventData = []
            for (let e = 0 ; e < allEventDate[i].Event.length ; e++) {
                eventData[e] = await db.Event.findOne({
                    where: {
                        id: allEventDate[i].Event[e].id,
                    },
                    include: ['User', 'Tag', 'UserFavorite', 'EventDate', 'EventTime'],
                })
            }
            event[i] = eventData
        }
        const eventData = {
            'eventDate': eventDate,
            'event': event
        }
        return eventData
    },
    findOneEvent: async function (EventId) {
        const oneEvent = await db.Event.findOne({
            where: {
                id: EventId,
            },
            include: ['User', 'Tag', 'UserFavorite','EventDate', 'EventTime'],
        })
        return oneEvent
    },
    eventCreate: async function (res, EventId, params) {
        let year = moment(params.holdDate).format('Y');
        let month = moment(params.holdDate).format('M');
        let day = moment(params.holdDate).format('D');
        let start = moment(params.holdDate).format('HH');

        let EventDate = await db.EventDate.findOrCreate({
            where: {
                year: year,
                month: month,
                day: day,
            }
        })
        let EventTime = await db.EventTime.findOrCreate({
            where: {
                start: start
            }
        })

        const newEvent = await db.Event.create({
            userId: EventId,
            title: params.title,
            subTitle: params.subTitle,
            detail: params.detail,
            EventDateId: EventDate[0].id,
            EventTimeId: EventTime[0].id,
            capacity: params.capacity,
            address: params.address,
            price: params.price,
        }).catch((err) => {
            return err
        });
        return newEvent;
    },
    eventUpdate: async function (res, EventId, params){
        let year = moment(params.holdDate).format('Y');
        let month = moment(params.holdDate).format('M');
        let day = moment(params.holdDate).format('D');
        let start = moment(params.holdDate).format('HH');

        let EventDate = await db.EventDate.findOrCreate({
            where: {
                year: year,
                month: month,
                day: day,
            }
        })
        let EventTime = await db.EventTime.findOrCreate({
            where: {
                start: start
            }
        })

        await db.Event.update({
            title: params.title,
            subTitle: params.subTitle,
            detail: params.detail,
            EventDateId: EventDate[0].id,
            EventTimeId: EventTime[0].id,
            capacity: params.capacity,
            address: params.address,
            price: params.price,
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
        let Year = moment(oneEvent.holdDate).format('Y');
        let Month = moment(oneEvent.holdDate).format('M');
        let Date = moment(oneEvent.holdDate).format('D');
        let Time = moment(oneEvent.holdDate).format('HH:mm');
        if (Month.length == 1) {
            Month = "0" + Month
        }
        if (Date.length == 1) {
            Date = "0" + Date
        }
        const holdDate = {
            Year: Year,
            Month: Month,
            Date: Date,
            Time: Time
        };
        return holdDate;
    },
    getFomatedDate: function (res, EventDate, EventTime){
        let Year = String(EventDate.year);
        let Month = String(EventDate.month);
        let Date = String(EventDate.day);
        let Time = String(EventTime.start);

        if (Month.length == 1) {
            Month = "0" + Month
        }
        if (Date.length == 1) {
            Date = "0" + Date
        }
        Time = Time + ":00"
        const holdDate = {
            Year: Year,
            Month: Month,
            Date: Date,
            Time: Time
        };
        return holdDate;
    },
    eachEventFavoriteLength: function (res, eventAllData) {
        let favoriteLengthList = {};

        if (eventAllData.length == 0) return false;

        eventAllData.forEach(function(oneEventData, key ) {
            //各イベントにお気に入りがつけられた数
            let favoriteLength = oneEventData.UserFavorite.length
            favoriteLengthList[oneEventData.id] = favoriteLength//イベントのid : お気に入りの数
        });
        let allEventId = Object.keys(favoriteLengthList);

        let favoriteEventList = []
        //一番お気に入りがつけられているイベントのidを取得
        let mostFavoritedEventId = favariteLengthCount(res, allEventId, favoriteLengthList)

        favoriteEventList.push(mostFavoritedEventId)

        //二番目にお気に入りがつけられているイベントのidを取得
        for(let i = 0 ; i < allEventId.length ; i++){
            if(allEventId[i] == mostFavoritedEventId){
                //spliceメソッドで要素を削除
                allEventId.splice(i, 1);
            }
        }
        let secondFavoritedEventId = favariteLengthCount(res, allEventId, favoriteLengthList)

        favoriteEventList.push(secondFavoritedEventId)

        return favoriteEventList
    },
    fileCreateToS3: async function (req, res, next, newEventId) {
    
        if (req.files == null || !req.files.uploadFile) {
            res.redirect('/events/')
        }
        const s3 = new AWS.S3();
        const fileContent  = Buffer.from(req.files.uploadFile.data, 'binary');
        const fileName = req.session.newEvent + req.files.uploadFile.name//画像名
    
        // Setting up S3 upload parameters
        const params = {
            Bucket: 'eventernagamori/events',
            Key: fileName,
            Body: fileContent 
        };

        await db.Event.update({
            image: fileName,
        }, {
            where: { id: newEventId }
        }).catch(err => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        })
    
        // Uploading files to the bucket
        s3.upload(params, function(err, data) {
            if (err) {
                throw err;
            }
        });
        res.redirect('/events/')
    },
    fileUploadToS3: async function (req, res, next, updateEventId) {
    
        if (!req.files) {
            res.redirect('/events/')
        }
        const s3 = new AWS.S3();
        const fileContent  = Buffer.from(req.files.file.data, 'binary');
        const fileName = req.session.newEvent + req.files.file.name//画像名
        // Setting up S3 upload parameters
        const params = {
            Bucket: 'eventernagamori/events',
            Key: fileName,
            Body: fileContent 
        };
        await db.Event.update({
            image: fileName,
        }, {
            where: { id: updateEventId }
        }).catch(err => {
            res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
        })

        s3.upload(params, function(err, data) {
            if (err) {
                throw err;
            }
        });
        
    },
    orderByDateTime: function (req, res, eventAllData, holdDate) {
        let eventInfo = []
        /*イベントの数だけ日付とイベント情報をセットで配列に格納
        eventInfo = {
                        event : イベント情報,
                        datetime : 開催日時
                    }
        */
        for (let m = 0 ; m < eventAllData.length ; m++) {
            eventInfo[m] = {
                event : eventAllData[m],
                datetime : holdDate[m]
            }
        }
        //開催日時ごとにイベントをまとめる
        let filterHoldDate = holdDate.filter((element, index, self) =>
            self.findIndex(e => 
                e.Year === element.Year &&
                e.Month === element.Month &&
                e.Date === element.Date
            ) === index
        );
        /*配列し直す
        dateTimeList = [2021-XX-XX、2021-YY-YY、2021-ZZ-ZZ]
        displayEventData = [
            [ //日毎のまとまりでイベントをまとめる
                {イベントA},
                {イベントB}
            ],[
                {イベントC},
                {イベントD}
            ]
        ]
         */
        let dateTimeList = []
        let displayEventData = []
        for (let i = 0 ; i < filterHoldDate.length ; i++) {
            let oneHoldDate = []
            let oneDay = ""
            for (let n = 0 ; n < eventInfo.length ; n++) {
                if (filterHoldDate[i].Month == eventInfo[n].datetime.Month &&
                    filterHoldDate[i].Date == eventInfo[n].datetime.Date) {
                        oneHoldDate.push(eventInfo[n].event)
                }
            }
            oneDay = String(filterHoldDate[i].Year)+"-"+String(filterHoldDate[i].Month)+"-"+String(filterHoldDate[i].Date)
            
            displayEventData[i] = oneHoldDate
            dateTimeList[i] = oneDay
        }
        //日毎のまとまりでイベント情報を返す。
        let sortedEventByDateTime = {
            "EventData" : displayEventData,
            "dateTime" : dateTimeList
        }
        return sortedEventByDateTime
    },
    payEventPrice: async function (req, res) {
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
            
          return response;
      
        } catch (err) {
          const response = generateErrorResponse(err.message);
      
          res.status(500);
          res.send(response);
        }
    }
}

function favariteLengthCount (res, allEventId, favoriteLengthList) {
    let FavoriteCount = 0
    let mostFavoritedEventId
    for( let i = 0; i < allEventId.length; i++ ) {
        //一番大きい要素のみが最後にFavoriteCountに渡されるようにする。
        let oneEventId = allEventId[i]
        if (i == 0) {
            mostFavoritedEventId = oneEventId;// 1
        }
        if (FavoriteCount < favoriteLengthList[oneEventId]){
            FavoriteCount = favoriteLengthList[oneEventId]
            mostFavoritedEventId = oneEventId
        }
    }
    return mostFavoritedEventId
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
