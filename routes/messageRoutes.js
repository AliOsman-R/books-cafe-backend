const express = require('express')
const {verifyToken} = require('../middleware/verifyToken')
const  {sendMessage, getMessages} = require('../controllers/messageController')

const router = express.Router()

router.use(verifyToken);

router.route('/:id').post(sendMessage).get(getMessages)


module.exports = router;