const express = require('express');
const multer  = require('multer')
const path = require('path')

const {verifyToken} = require('../middleware/verifyToken');
const {uploadImage, uploadImages, updateImages} = require("../controllers/imageController");

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  const upload = multer({ storage: storage });


router.use(verifyToken);

router.put('/:id', upload.single('image'), uploadImage)

router.post('/', upload.array('images', 5), uploadImages)

router.put('/', upload.array('images', 5), updateImages)



module.exports = router;