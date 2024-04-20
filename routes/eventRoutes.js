const express = require('express')
const {verifyToken} = require('../middleware/verifyToken');
const {getCafeEvents, addEvent, getEvent, updateEvent, deleteEvent, getAllEvents, getUserEvents} = require('../controllers/eventController');

const router = express.Router()


router.get('/all-events/', getAllEvents)

router.get('/cafe-events/:id', getCafeEvents) 

router.use(verifyToken);

router.get('/user-events/:id', getUserEvents) 

router.route('/:id').post(addEvent).get(getEvent).put(updateEvent).delete(deleteEvent)




module.exports = router;