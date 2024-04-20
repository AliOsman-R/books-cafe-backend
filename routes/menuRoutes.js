const express = require('express')
const {verifyToken} = require('../middleware/verifyToken');
const {getCafeMenu, addMenuItem, getMenuItem, updateMenuItem, deleteMenuItem, getUserMenu} = require('../controllers/menuController');

const router = express.Router()

router.get('/cafe-menu/:id', getCafeMenu)

router.use(verifyToken);

router.get('/user-menu/:id', getUserMenu)

router.route('/:id').post(addMenuItem).get(getMenuItem).put(updateMenuItem).delete(deleteMenuItem)




module.exports = router;