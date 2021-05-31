const express = require('express');
const { use } = require('../app');
const router = express.Router();
const usersController = require('../controllers/usersController');
const eventsController = require('../controllers/eventsController');

router.get('/', usersController.verifyJWT, eventsController.index);
router.get('/add', usersController.verifyJWT, eventsController.add);
router.post('/add', usersController.verifyJWT, eventsController.create, eventsController.imageRegister);
router.get('/show/:id', usersController.verifyJWT, eventsController.show);
router.get('/edit/:id', usersController.verifyJWT, eventsController.edit);
router.post('/update/:id', usersController.verifyJWT, eventsController.update, eventsController.tagUpdate, eventsController.imageUpload);
router.get('/delete/:id', usersController.verifyJWT, eventsController.delete);
router.post('/join', usersController.verifyJWT, eventsController.join);
router.get('/search/:TagName', usersController.verifyJWT, eventsController.search);
router.get('/history', usersController.verifyJWT, eventsController.history);
router.post('/Favorite', usersController.verifyJWT, eventsController.favorite);
router.get('/FavoriteList', usersController.verifyJWT, eventsController.FavoriteList);

module.exports = router;