const express = require('express')
const {verifyToken} = require('../middleware/verifyToken');
const {cafeSwitch, getUserCafe, updateCafe, geAlltCafes,
     getNearCafes, switchToCustomer, switchToExistentCafe} = require('../controllers/cafeController');

const router = express.Router()

router.get('/', geAlltCafes);

router.get('/near-cafes', getNearCafes);

router.use(verifyToken);

router.route('/:id').post(cafeSwitch).put(updateCafe)

router.get('/user-cafe/:id',getUserCafe)

router.post('/switch-to-customer/:id',switchToCustomer)

router.post('/switch-to-existent-cafe/:id',switchToExistentCafe)


module.exports = router;