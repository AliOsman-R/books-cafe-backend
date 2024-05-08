const express = require('express')
const {verifyToken} = require('../middleware/verifyToken');
const { getUserOrders, updateOrderStatus, deleteOrder, getCafeOrders, getOrder, updateProgressStatus} = require('../controllers/orderController');

const router = express.Router()

router.use(verifyToken);


router.route('/:id').get(getOrder).delete(deleteOrder)

router.get('/user-orders/:id', getUserOrders)

router.get('/cafe-orders/:id', getCafeOrders)

router.put('/update-status/:id', updateOrderStatus)

router.put('/update-progress/:id', updateProgressStatus)


module.exports = router;