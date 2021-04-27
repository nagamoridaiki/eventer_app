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
        cb(null, req.session.user.id + req.session.user.name + ".jpg")
    }
})
const upload = multer({ storage: storage })

router.get('/login', usersController.login);
router.get('/register', usersController.register);
router.post('/create', usersController.create, usersController.indexView);

router.post('/login', usersController.apiAuthenticate, usersController.index);
router.post('/delete/', usersController.verifyJWT, usersController.delete, usersController.indexView);


router.get('/', usersController.verifyJWT, usersController.index, usersController.indexView);
router.get('/logout', usersController.logout)
router.get('/user/:id', usersController.verifyJWT, usersController.myProf);
router.get('/user/:id/edit', usersController.verifyJWT, usersController.Edit);
router.post('/user/:id/update', usersController.verifyJWT, usersController.update);

router.post('/image', usersController.verifyJWT, upload.single('file'), usersController.imageUpload)
router.get('/add', usersController.verifyJWT, eventsController.add);

//router.post('/add', usersController.verifyJWT, eventsController.create);

module.exports = router;