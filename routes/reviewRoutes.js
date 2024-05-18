const express = require('express')
const {verifyToken} = require('../middleware/verifyToken');
const {getReviews, postReview, getUserReviews, updateReview, getCafeReviews} = require('../controllers/reviewController');

const router = express.Router()


router.route('/:id').get(getReviews)

router.use(verifyToken);

router.route('/:id').post(postReview).put(updateReview)

router.get('/user/:id', getUserReviews)

router.get('/cafe/:id', getCafeReviews)



module.exports = router;