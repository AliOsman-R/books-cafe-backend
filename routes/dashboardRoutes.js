const express = require('express')
const {verifyToken} = require('../middleware/verifyToken');
const {getCafeDashboard} = require('../controllers/dashboardController');

const router = express.Router()

router.use(verifyToken);

router.get('/:id', getCafeDashboard)


module.exports = router;