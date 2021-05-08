const express = require('express');
const { use } = require('../app');
const router = express.Router();
const usersController = require('../controllers/usersController');
const eventsController = require('../controllers/eventsController');
const articlesController = require('../controllers/articlesController');



router.get('/add', usersController.verifyJWT, articlesController.add);
router.post('/add', usersController.verifyJWT, articlesController.create);
router.get('/', usersController.verifyJWT, articlesController.index);
router.post('/like', usersController.verifyJWT, articlesController.like);
router.post('/commentAdd', usersController.verifyJWT, articlesController.commentAdd);


module.exports = router;