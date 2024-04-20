const express = require('express');
const {verifyToken} = require('../middleware/verifyToken');
const {userUpdateInfo, userUpdatePassword} = require("../controllers/userController");


const router = express.Router();

router.use(verifyToken);

router.put('/update-info/:id', userUpdateInfo);

router.put('/update-password/:id', userUpdatePassword);


module.exports = router;