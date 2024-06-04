const express = require('express');
const {verifyToken, isAdminAuth} = require('../middleware/verifyToken');
const {adminLogin, createAdmin, adminLogout, adminAuth, deleteUser, getAllUsers} = require("../controllers/adminController");


const router = express.Router();

router.post('/login/', adminLogin);

router.post('/logout/', adminLogout);

router.get('/is-admin-auth', isAdminAuth, adminAuth)

router.use(verifyToken);

router.get('/all-users', getAllUsers)

router.post('/create/', createAdmin);

router.delete('/delete-user/:id', deleteUser);





module.exports = router;