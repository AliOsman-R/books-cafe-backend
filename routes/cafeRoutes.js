const express = require('express')
const router = express.Router()
const multer = require('multer');
const path = require('path')

const {verifyToken} = require('../middleware/verifyToken');
const {cafeSwitch, getCafe, updateCafe, geAlltCafes} = require('../controllers/cafeController');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/', geAlltCafes);

router.use(verifyToken);
router.route('/:id').post(cafeSwitch).put(upload.single('image'),updateCafe);


router.get('/:id', getCafe);


module.exports = router;