const express = require('express');
const { use } = require('../app');
const router = express.Router();
const usersController = require('../controllers/usersController');
const eventsController = require('../controllers/eventsController');
const articlesController = require('../controllers/articlesController');



router.get('/add', usersController.verifyJWT, articlesController.add);
router.post('/add', usersController.verifyJWT, articlesController.create);


module.exports = router;