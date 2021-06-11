const express = require('express');
const { use } = require('../app');
const router = express.Router();
const usersController = require('../controllers/usersController');
const eventsController = require('../controllers/eventsController');
const path = require('path');
const sharp = require('sharp');

router.get('/login', usersController.login);
router.get('/register', usersController.register);
router.post('/create', usersController.create, usersController.indexView);

router.post('/login', usersController.apiAuthenticate, eventsController.index);
router.post('/delete/', usersController.verifyJWT, usersController.delete, usersController.indexView);


router.get('/', usersController.verifyJWT, usersController.index, usersController.indexView);
router.get('/logout', usersController.logout)
router.get('/user/:id', usersController.verifyJWT, usersController.myProf);
router.get('/user/:id/edit', usersController.verifyJWT, usersController.Edit);
router.post('/user/:id/update', usersController.verifyJWT, usersController.update, usersController.imageUpload);
router.get('/user/:id/follow', usersController.verifyJWT, usersController.follow);

router.post('/upload', usersController.verifyJWT, usersController.imageUpload);

router.get('/add', usersController.verifyJWT, eventsController.add);
router.get('/userSearch', usersController.verifyJWT, usersController.search);
router.post('/search', usersController.verifyJWT, usersController.searchUser);

router.post("/v1/order/payment", usersController.verifyJWT, eventsController.pay);

module.exports = router;