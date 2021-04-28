const express = require('express');
const { use } = require('../app');
const router = express.Router();
const usersController = require('../controllers/usersController');
const eventsController = require('../controllers/eventsController');
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images/')
    },
    filename: function(req, file, cb) {
        cb(null, req.session.user.id + req.session.user.name + "event.jpg")
    }
})
const upload = multer({ storage: storage })


router.get('/', usersController.verifyJWT, eventsController.index);
router.get('/add', usersController.verifyJWT, eventsController.add);
router.post('/add', usersController.verifyJWT, upload.single('file'), eventsController.create);
router.get('/show/:id', usersController.verifyJWT, eventsController.show);
router.get('/edit/:id', usersController.verifyJWT, eventsController.edit);
router.post('/update/:id', usersController.verifyJWT, eventsController.update, eventsController.tagUpdate);
router.get('/delete/:id', usersController.verifyJWT, eventsController.delete);
router.post('/join', usersController.verifyJWT, eventsController.join);
router.get('/search/:TagName', usersController.verifyJWT, eventsController.search);
router.get('/history', usersController.verifyJWT, eventsController.history);
router.post('/Favorite', usersController.verifyJWT, eventsController.favorite);
router.get('/FavoriteList', usersController.verifyJWT, eventsController.FavoriteList);

module.exports = router;