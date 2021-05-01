"use strict";

const User = require("../models/user")
const Event = require("../models/event")
const Article = require("../models/article")
const Join = require("../models/join")
const Like = require("../models/like")
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
    articleCreate: async function (ArticleId, params) {
        const newArticle = await db.Article.create({
            userId: ArticleId,
            title: params.title,
            detail: params.detail,
            //image: EventId + "event.jpg",
        }).catch((err) => {
            return err
        });
        return newArticle;
    },

}