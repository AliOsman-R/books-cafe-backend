const asyncHandler = require('../middleware/tryCatch');
const User = require('../models/userModel')
const Admin = require('../models/adminModel')
const jwt = require('jsonwebtoken');

const isAdminAuth = asyncHandler( async (req, res, next) => {
    const cookies = req.headers.cookie?.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
        }, {});
        
    const token = cookies?.access_token_admin || req.headers.cookie?.split('=')[1];
    if (!token) {
        req.adminAuth = false
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (error, decode) => {
        try {
            if (error ) {
                res.clearCookie('access_token_admin', { sameSite: 'None', secure: true })
                req.adminAuth = false
                console.log("err")
                return next()
            }

            const decodedAdmin = decode.user
            const foundAdmin = await Admin.findOne({userName:decodedAdmin.userName});
            
            if (!foundAdmin) {
                res.clearCookie('access_token_admin', { sameSite: 'None', secure: true })
                req.adminAuth = false
                return next()
            }

            const admin = {
                userName:foundAdmin.userName
            }

            const refreshToken = generateAccessToken(admin)
            req.admin = admin
            req.refreshToken = refreshToken
            req.adminAuth = true
            next()
        } catch (error) {
            console.log('error: ', error);
            return res.json({adminAuth: false})
        }

    })
})

const isUserAuth = asyncHandler( async (req, res, next) => {
    const cookies = req.headers.cookie?.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
        }, {});
        
    const token = cookies?.access_token || req.headers.cookie?.split('=')[1];
    if (!token) {
        req.auth = false
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (error, decode) => {
        try {
            if (error ) {
                res.clearCookie('access_token', { sameSite: 'None', secure: true })
                req.auth = false
                console.log("err")
                return next()
            }

            const decodedUser = decode.user
            const foundUser = await User.findOne({email:decodedUser.email});

            if (!foundUser) {
                res.clearCookie('access_token', { sameSite: 'None', secure: true })
                req.auth = false
                return next()
            }

            const user = {
                email:foundUser.email,
                phoneNumber:foundUser.phoneNumber,
                _id:foundUser._id,
                name:foundUser.name,
                role:foundUser.role,
                firstAddress:foundUser.firstAddress,
                secondAddress:foundUser.secondAddress,
                profileImage:foundUser.profileImage,
                imageId:foundUser.imageId,
            }

            if(foundUser.cafeId)
                user['cafeId'] = foundUser.cafeId

            const refreshToken = generateAccessToken(user)
            req.user = user
            req.refreshToken = refreshToken
            req.auth = true
            next()
        } catch (error) {
            console.log('error: ', error);
            return res.json({auth: false})
        }

    })
})

const verifyToken = asyncHandler( async (req, res, next) => {
    const cookies = req.headers.cookie?.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
        }, {});
        
    const token = cookies?.access_token || req.headers.cookie?.split('=')[1];
    if(!token)
    {
        res.status(401)
        throw new Error("User is not authorized or token is missing")
    }

jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decode)=>{
    try{
        if(err)
        {
            console.log("error run")
            res.status(401)
            res.clearCookie('access_token', { sameSite: 'None', secure: true })
            throw new Error("User is not authorized")
        }
        
        const user = decode.user        
        const refreshToken = generateAccessToken(user)
        req.user = {...user}
        req.refreshToken = refreshToken
        req.token = token
        res.cookie('access_token',refreshToken, { httpOnly: true, secure: true, maxAge: 18000000,  domain: 'https://books-cafe-backend.vercel.app',   sameSite: 'None', })
        next()
    }
    catch (error) {
        console.log(error);
        res.clearCookie('access_token', { sameSite: 'None', secure: true })
        return res.status(401).json({
            message: 'Unauthorized',
            data: {}
        })
    }
})
})

function generateAccessToken(user) {
    return jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5h' })
}

module.exports = {verifyToken, isUserAuth, isAdminAuth, generateAccessToken};