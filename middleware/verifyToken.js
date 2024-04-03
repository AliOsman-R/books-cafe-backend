const asyncHandler = require('../middleware/tryCatch');
const Image = require('../models/imageModel');
const User = require('../models/userModel')
const jwt = require('jsonwebtoken');
const { getImage } = require('../utils/Images');

const isUserAuth = asyncHandler( async (req, res, next) => {
    const token = req.headers.cookie?.split('=')[1]
    if (!token) {
        req.auth = false
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (error, decode) => {
        try {
            
            if (error ) {
                res.clearCookie('access_token')
                req.auth = false
                console.log("err")
                return next()
            }

            const decodedUser = decode.user

            const avaiableUser = await User.findOne({email:decodedUser.email});

            if (!avaiableUser) {
                res.clearCookie('access_token')
                req.auth = false
                return next()
            }

            const user = {
                email:avaiableUser.email,
                phoneNumber:avaiableUser.phoneNumber,
                _id:avaiableUser._id,
                name:avaiableUser.name,
                role:avaiableUser.role,
                firstAddress:avaiableUser.firstAddress,
                secondAddress:avaiableUser.secondAddress
            }

            const imageUrl = await getImage(avaiableUser.profileImage)

            const refreshToken = generateAccessToken(user)
            req.user = {...user,profileImage:imageUrl || ''}
            req.refreshToken = refreshToken
            req.auth = true
            next()
        } catch (error) {
            console.log('error: ', error);
            return res.json({auth: false})
        }

    })

})

const verifyToken = asyncHandler( async (req,res,next) => {
const token = req.headers.cookie?.split('=')[1];
if(!token)
{
    res.status(401)
    throw new Error("User is not authorized or token is missing")
}

jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decode)=>{

    try{
        
        if(err)
        {
            res.status(401)
            res.clearCookie('access_token')
            throw new Error("User is not authorized")
        }
        
        const user = decode.user        
        const refreshToken = generateAccessToken(user)
        req.user = {...user}
        req.refreshToken = refreshToken
        req.token = token
        res.cookie('access_token',refreshToken, { httpOnly: true, secure: true, maxAge: 18000000 })
        next()
    }
    catch (error) {
        console.log(error);
        res.clearCookie('user-session')
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

module.exports = {verifyToken, isUserAuth, generateAccessToken};