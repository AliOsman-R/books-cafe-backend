const express = require('express');
const {isUserAuth, verifyToken} = require('../middleware/verifyToken')
const {userSignup, userLogin, userLogout, userVerifyEmail, userForgotPass,
     userVerifyResetPass, userResetPass, userAuth} = require("../controllers/authController")

const router = express.Router();

router.get('/is-user-auth', isUserAuth, userAuth)

router.post('/signup',userSignup);

router.get('/email/:id/verify/:token', userVerifyEmail);

router.post('/login', userLogin);

router.post('/forgot-password', userForgotPass);

router.route('/reset-password/:id/verify/:token').get(userVerifyResetPass).put(userResetPass);

router.post('/logout', userLogout)

module.exports = router;