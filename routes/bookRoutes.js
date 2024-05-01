const express = require('express')
const {verifyToken} = require('../middleware/verifyToken');
const {getCafebooks, getUserbooks, addBook, updateBook, deleteBook} = require('../controllers/bookController');

const router = express.Router()

router.get('/cafe-books/:id', getCafebooks)

router.use(verifyToken);

router.get('/user-books/:id', getUserbooks)

router.route('/:id').post(addBook).put(updateBook).delete(deleteBook)




module.exports = router;