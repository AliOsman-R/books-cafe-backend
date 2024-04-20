const express = require('express')
const {verifyToken} = require('../middleware/verifyToken');
const {cafeSwitch, getUserCafe, updateCafe, geAlltCafes, getCafeById} = require('../controllers/cafeController');

const router = express.Router()

router.get('/', geAlltCafes);

// router.use(verifyToken);

router.route('/:id').post(verifyToken,cafeSwitch).put(verifyToken,updateCafe).get(getCafeById)
router.get('/user-cafe/:id',verifyToken,getUserCafe)


module.exports = router;