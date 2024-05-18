const User = require('../models/userModel')
const asyncHandler = require('../middleware/tryCatch');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');
const Token = require('../models/tokenModel');
const Image = require('../models/imageModel');
const { generateAccessToken } = require('../middleware/verifyToken');
const { getImage } = require('../utils/Images');

const userSignup = asyncHandler(async(req,res) => {
    const  {name,email,password} = req.body;

    if(!name || !email || !password)
    {
        res.status(400)
        throw new Error("all fields are required");
    }

    const foundUser = await User.findOne({email:email.toLowerCase()})
    if(foundUser)
    {
        res.status(400)
        throw new Error(`User already registered with this email ${email}`);
    }

    const hashedPassword = await bcrypt.hash(password,10)

    const image = await Image.create({imageName:''})

    const user = await User.create({
        email:email.toLowerCase(),
        name,
        imageId:image._id,
        password:hashedPassword,
        role:'customer',
    })


    const token = await Token.create({
        userId:user._id,
        token:crypto.randomBytes(32).toString("hex"),
        type:"email"
    })

    const url = `${process.env.BASE_URL}/email/${user._id}/verify/${token.token}`

    if(user)
    {
        const htmlStr = `
            <h2>Verify your email address</h2>
            <p>To continue setting up your CafeX account,</p>
            <p>Please verify that this is your email address by clicking the link below:</p>
        `
        await sendEmail(user.email, 'CafeX - Verify your email',{htmlStr,url,btn:"Verify email address"})
        res.status(201).json({message: "An email sent to your email address please verify"})
    }
    else
    {
        res.status(400)
        throw new Error("somthing went wrong");
    }

})

const userVerifyEmail = asyncHandler( async (req, res, next) => {

    const user = await User.findOne({ _id: req.params.id });

    const token = await Token.findOne({
        userId: user?._id,
        token: req.params.token,
    });

    if (!user || !token) 
    {
        res.status(400)
        throw new Error("Invalid link")
    }

    if (user.newEmail) {
        const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            { email: user.newEmail, $unset: { newEmail: '' }},
            {new:true}
        );
        userToken = {email:updatedUser.email, _id:updatedUser._id, name:updatedUser.name, role:updatedUser.role}
        const refreshToken = generateAccessToken(userToken)
        res.cookie('access_token',refreshToken, { httpOnly: true, secure: true, maxAge: 18000000 })
    }
    else
        await User.findOneAndUpdate({ _id: user._id},{verified: true });

    await token.deleteOne({
        userId: user?._id,
        token: req.params.token,
    });

    res.status(200).json({ message: "Email verified successfully" });
})

const userLogin = asyncHandler(async(req,res, next) => {
    const  {email,password} = req.body;
    let imageUrl='';

    if(!email || !password)
    {
        res.status(400)
        throw new Error("all fields are required");
    }

    const foundUser = await User.findOne({email:email.toLowerCase()}).populate({ path: 'imageId'}).exec();
    
    if(!foundUser || !(await bcrypt.compare(password, foundUser?.password)))
    {
        res.status(401)
        throw new Error("Email or Password is not valid");
    }

    if(!foundUser.verified)
    {
        let token = await Token.findOne({userId:foundUser._id, type:'email'})
        if(!token)
        {
            token = await Token.create({
               userId:foundUser._id,
               token:crypto.randomBytes(32).toString("hex"),
               type:"email"
           })
       
           const url = `${process.env.BASE_URL}/email/${foundUser._id}/verify/${token.token}`
           const htmlStr = `
                <h2>Verify your email address</h2>
                <p>To continue setting up your CafeX account,</p>
                <p>Please verify that this is your email address by clicking the link below:</p>
            `
           
           await sendEmail(foundUser.email, 'CafeX - Verify your email',{htmlStr,url,btn:"Verify email address"})
        }

        res.status(401)
        throw new Error("Please verify your email to access, an email sent to your email address");
    }

    const token = jwt.sign({
        user:{
            email:foundUser.email,
            _id:foundUser._id,
            name:foundUser.name,
            role:foundUser.role,
        }
    },process.env.ACCESS_TOKEN_SECRET,{expiresIn:'5h'})

    res.cookie('access_token',token, { httpOnly: true, secure: true, maxAge: 18000000 })
    
    if(foundUser.imageId.imageName)
    {
        imageUrl = await getImage(foundUser.imageId.imageName)
        if(imageUrl)
        {
            foundUser.profileImage = imageUrl
            await foundUser.save()
        }
    }
    
    const user = {
        email:foundUser.email,
        _id:foundUser._id,
        name:foundUser.name,
        role:foundUser.role,
        firstAddress:foundUser.firstAddress,
        secondAddress:foundUser.secondAddress,
        profileImage:imageUrl || '',
        imageId:foundUser.imageId._id
    }

    if(foundUser.cafeId)
        user['cafeId'] = foundUser.cafeId

    res.status(200).json({auth: true, user})
})

const userForgotPass = asyncHandler( async (req, res, next) => {
    const {email} = req.body;

    const user = await User.findOne({email:email.toLowerCase()});
    console.log("runn")

    if(!user)
    {
        res.status(404)
        throw new Error(`No user found with this "${email}" email`)
    }

    const token = await Token.create({
        userId:user._id,
        token:crypto.randomBytes(32).toString("hex"),
        type:"password"
    })

    const url = `${process.env.BASE_URL}/auth/reset-password/${user._id}/${token.token}`

    const htmlStr = `
            <h2>Reset your password</h2>
            <p>To continue use your CafeX account,</p>
            <p>To reset your password please click the link below:</p>
        `

    const endingText = ` <span>This link will expire in an hour. If you did not make this request, please disregard this email.</span>`
    await sendEmail(email, "CafeX - Reset password", {btn:"Reset Password", url, htmlStr}, endingText)
    res.status(200).json({message:"An email sent to your email address"})
})

const userVerifyResetPass = asyncHandler( async (req, res, next) => {

    const user = await User.findOne({ _id: req.params.id });

    const token = await Token.findOne({
        userId: user?._id,
        token: req.params.token,
    });

    if (!user || !token) 
    {
        res.status(400)
        throw new Error("Invalid link")
    }

    res.status(200).json({ message: "Token verified successfully" });

})

const userResetPass = asyncHandler( async (req, res, next) => {

    const {password} = req.body;

    console.log('pass: ',password)

    const user = await User.findOne({ _id: req.params.id });

    const token = await Token.findOne({
        userId: user?._id,
        token: req.params.token,
    });

    if (!user || !token) 
    {
        res.status(400)
        throw new Error("Invalid link")
    }

    user.password = await bcrypt.hash(password, 10)
    await user.save()

    await token.deleteOne({
        userId: user?._id,
        token: req.params.token,
    });

    res.status(200).json({ message: "Password updated successfully" });

})

const userAuth = asyncHandler( async (req, res,next) => {

    if (req.auth) {
        res.cookie('access_token',req.refreshToken, {    
            secure: true,
            httpOnly: true,
            sameSite: 'lax' 
        });
    }
    res.json({auth: req.auth, user: req.user})

})

const userLogout = (req, res) => {
    res.clearCookie('access_token')
    res.send('Cookie has been deleted successfully');
}

module.exports = 
{
    userSignup, 
    userLogin, 
    userLogout, 
    userVerifyEmail, 
    userForgotPass, 
    userVerifyResetPass, 
    userResetPass, 
    userAuth
}