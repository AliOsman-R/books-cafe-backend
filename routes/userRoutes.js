const express = require('express');
const {verifyToken} = require('../middleware/verifyToken');
const {userUpdateInfo, userUpdatePassword, getChatUsers, getUser, deleteAccount, generateUser} = require("../controllers/userController");


const router = express.Router();

// router.post('/genreate-user', generateUser);

router.use(verifyToken);

router.put('/update-info/:id', userUpdateInfo);

router.put('/update-password/:id', userUpdatePassword);

router.get('/chat-user/:id', getUser);

router.get('/chat-users/:id', getChatUsers);

router.delete('/delete-account/:id', deleteAccount);


module.exports = router;