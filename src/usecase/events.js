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
    eachEventFavoriteLength: function (eventAllData) {
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
        let mostFavoritedEventId = favariteLengthCount(allEventId, favoriteLengthList)

        favoriteEventList.push(mostFavoritedEventId)

        //二番目にお気に入りがつけられているイベントのidを取得
        allEventId.pop(mostFavoritedEventId)
        let secondFavoritedEventId = favariteLengthCount(allEventId, favoriteLengthList)

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

}

function favariteLengthCount (allEventId, favoriteLengthList) {
    let FavoriteCount = 0
    let mostFavoritedEventId
    for( let i = 0; i < allEventId.length; i++ ) {
        //一番大きい要素のみが最後にFavoriteCountに渡されるようにする。
        let oneEventId = allEventId[i]
        if (i == 0) {
            mostFavoritedEventId = oneEventId;
        }
        if (FavoriteCount < favoriteLengthList[oneEventId]){
            FavoriteCount = favoriteLengthList[oneEventId]
            mostFavoritedEventId = oneEventId
        }
    }
    return mostFavoritedEventId
}
