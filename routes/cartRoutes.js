const express = require('express')
const {verifyToken} = require('../middleware/verifyToken');
const { addToCart, getUserCart, updateCartItem, deleteCartItem, clearCart, placeOrder} = require('../controllers/cartController');

const router = express.Router()

router.use(verifyToken);

router.route('/:id').post(addToCart).put(updateCartItem).delete(deleteCartItem).get(getUserCart)

router.delete('/clear/:id', clearCart)

router.post('/place-order/:id', placeOrder)




module.exports = router;