const User = require('../models/userModel')
const asyncHandler = require('../middleware/tryCatch');
const bcrypt = require('bcrypt')
const Admin = require('../models/adminModel')
const Book = require('../models/bookModel')
const Review = require('../models/reviewModel')
const Menu = require('../models/menuModel')
const Cafe = require('../models/cafeModel')
const Event = require('../models/eventModel')
const Cart = require('../models/cartModel')
const Image = require('../models/imageModel')
const crypto = require('crypto');
const Token = require('../models/tokenModel');
const { generateAccessToken } = require('../middleware/verifyToken');

const adminLogin = asyncHandler( async (req, res, next) => {
    const {userName, password} = req.body

    if(!userName || !password)
    {
        res.status(400)
        throw new Error("all fields are required");
    }

    const foundAmdin = await Admin.findOne({userName})
    
    if(!foundAmdin || !(await bcrypt.compare(password, foundAmdin?.password)))
    {
        res.status(401)
        throw new Error("Email or Password is not valid");
    }

    const user = {userName}
   
    const token = generateAccessToken(user)

    res.cookie('access_token',token, { httpOnly: true, secure: true, maxAge: 18000000 })

    res.status(200).json({adminAuth: true, admin:{userName:foundAmdin.userName}})
})


const createAdmin = asyncHandler( async (req, res, next) => {
    const {userName, password} = req.body

    if(!userName || !password)
    {
        res.status(400)
        throw new Error("all fields are required");
    }

    const foundAmdin = await Admin.findOne({userName})
    
    if(foundAmdin)
    {
        res.status(401)
        throw new Error("An admin already exists with this userName");
    }

    const hashedPassword = await bcrypt.hash(password,10)

    const createdAdmin = await Admin.create({
        userName,
        password:hashedPassword,
    })

    const admin = {
        _id:createdAdmin._id,
        userName:createdAdmin.userName,
        createdAt:createdAdmin.createdAt,
    }

    res.status(201).json({admin})
})


const adminLogout = asyncHandler( async (req, res, next) => {
    res.clearCookie('access_token')
    res.send('Cookie has been deleted successfully');
})


const getAllUsers  = asyncHandler( async (req, res, next) => {
    const users = await User.find().populate({path:'cafeId', select:'name createdAt'}).exec();

    res.status(200).json(users)
})


const deleteUser = asyncHandler( async (req, res, next) => {
    const id = req.params.id
    // const user = await User.findOne({_id:id});

    // if (!user) {
    //     res.status(404);
    //     throw new Error('User not found');
    // }

    // await Cafe.deleteMany({ userId: id });

    // await Book.deleteMany({ userId: id });

    // await Menu.deleteMany({ userId: id });

    // await Cart.deleteMany({ userId: id });

    // await Event.deleteMany({ userId: id });

    // await Review.deleteMany({ userId: id });
    
    // await Image.deleteMany({ _id: user.imageId });

    // await user.remove();

    res.status(200).json({ message: 'User and all associated data deleted' });


})


const adminAuth = asyncHandler( async (req, res,next) => {

    if (req.adminAuth) {
        res.cookie('access_token',req.refreshToken, {    
            secure: true,
            httpOnly: true,
            sameSite: 'lax' 
        });
    }
    res.json({adminAuth: req.adminAuth, admin: req.admin})

})

module.exports = {adminLogin, createAdmin, adminLogout, adminAuth, deleteUser, getAllUsers}