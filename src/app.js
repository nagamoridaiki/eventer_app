const createError = require('http-errors');
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const indexRouter = require('./routes/index');
const eventsRouter = require('./routes/events');
const articlesRouter = require('./routes/articles');
const session = require('express-session');
//const connectFlash = require("connect-flash");
const layouts = require("express-ejs-layouts");
const process = require('./config/process.js');
const cors = require("cors");

const app = express();

app.use(session({
    secret: process['SESSION_SECRET'],
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxage: 1000 * 60 * 30
    }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(layouts);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(connectFlash());
app.use(fileUpload());

// body parserの設定
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use('/', indexRouter);
app.use('/events', eventsRouter);
app.use('/articles', articlesRouter);

app.use(express.static(path.join(__dirname, 'public')))

module.exports = app;