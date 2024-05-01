const express = require('express')
const {verifyToken} = require('../middleware/verifyToken');
const {getReviews, postReview} = require('../controllers/reviewController');

const router = express.Router()


router.route('/:id').get(getReviews)

router.use(verifyToken);

router.route('/:id').post(postReview)


module.exports = router;