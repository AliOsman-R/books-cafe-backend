const express = require('express');
const multer  = require('multer')
const path = require('path')

const {verifyToken} = require('../middleware/verifyToken');
const {userUpdateInfo, userUpdatePassword} = require("../controllers/userController");


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

router.put('/update-info/:id', upload.single('profileImage'), userUpdateInfo);

router.put('/update-password/:id', userUpdatePassword);


module.exports = router;