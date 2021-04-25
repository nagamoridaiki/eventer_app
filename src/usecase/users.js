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
    findOneUser: async function (userId) {
        const oneUser = await db.User.findOne({
            where: {
                id: userId
            },
            include: ['Event'],
        })
        return oneUser
    },
}