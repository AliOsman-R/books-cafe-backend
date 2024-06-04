const express = require('express');
const {verifyToken} = require('../middleware/verifyToken');
const {userUpdateInfo, userUpdatePassword, getChatUsers, getUser} = require("../controllers/userController");


const router = express.Router();

router.use(verifyToken);

router.put('/update-info/:id', userUpdateInfo);3

router.put('/update-password/:id', userUpdatePassword);


router.get('/chat-user/:id', getUser);


router.get('/chat-users/:id', getChatUsers);


module.exports = router;