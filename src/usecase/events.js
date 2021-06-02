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
const path = require('path');
const sharp = require('sharp');

const AWS = require('aws-sdk');
var awsCredFile = path.join(__dirname, '../config/AwsConfig.json');
AWS.config.loadFromPath(awsCredFile);


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
            address: params.address,
        }).catch((err) => {
            return err
        });
        return newEvent;
    },
    eventUpdate: async function (res, EventId, params){
        await db.Event.update({
            title: params.title,
            subTitle: params.subTitle,
            detail: params.detail,
            holdDate: params.holdDate,
            capacity: params.capacity,
            address: params.address,
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
    eachEventFavoriteLength: function (res, eventAllData) {
        let favoriteLengthList = {};

        if (eventAllData.length == 0) return false;

        eventAllData.forEach(function(oneEventData, key ) {
            //各イベントにお気に入りがつけられた数
            let favoriteLength = oneEventData.UserFavorite.length
            favoriteLengthList[oneEventData.id] = favoriteLength//イベントのid : お気に入りの数
        });
        console.log(favoriteLengthList)
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
    fileUpload: async function (req, res, next, newEventId) {
        try {
    
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).send('No files were uploaded');
            }
        
            let uploadFile = req.files.uploadFile;
        
            // アップロードファイルは20MB以内
            if (uploadFile.size > 20*1024*1024) {
              return res.status(400).send('File size is too big');
            }
        
            // 対応しているのはpng, jpg, gif, jpegのファイルとする
            let uploadFileExt = path.extname(uploadFile.name);
        
            if(uploadFileExt !== '.png' && uploadFileExt !== '.jpg' && uploadFileExt !== '.gif' && uploadFileExt !== '.jpeg') {
              return res.status(400).send('Only png, jpg, gif and jpeg are available');
            }
        
            // 保存するファイル名は同じファイル名が生じるケースを考えてDate.now()をつけたす
            let saveFilename = `${path.basename(uploadFile.name, uploadFileExt)}-${Date.now()}${uploadFileExt}`;
        
            // サーバー上の保存位置
            let uploadPath = path.join(`./public/img/upload_events/${saveFilename}`);
        
            console.log(`ファイル名: ${uploadFile.name}`);
            console.log(`保存パス: ${uploadPath}`);
        
            // メモリ上にあるファイルをサーバーパスへ移動させる
            uploadFile.mv( uploadPath, async(err) => {

                if (err) {
                return res.status(500).send(err);
                }
                // sharpをt使ってリサイズする時のファイル名
                const resizeURL = `${path.basename(saveFilename, path.extname(saveFilename))}-resize.jpg`;

                sharp(uploadPath).resize(400, 400, {
                    fit: 'inside'
                }).toFile(path.join(`./public/img/upload_events/${resizeURL}`), (err, info)=>{
                    if(err){
                        throw err 
                    }
                    console.log(info);
                });

                await db.Event.update({
                    image: resizeURL,
                }, {
                    where: { id: newEventId }
                }).catch(err => {
                    res.render('layout', { layout_name: 'error', title: 'ERROR', msg: err });
                })

                res.redirect('/events/')
            });
        } catch (err) {
            console.log(err); next(err);
        }
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
        console.log("画像アップロードテスト", req.files.file)
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
