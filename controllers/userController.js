const User = require('../models/userModel')
const asyncHandler = require('../middleware/tryCatch');
const bcrypt = require('bcrypt')
const { sendEmail } = require('../utils/email');
const Cafe = require('../models/cafeModel')
const crypto = require('crypto');
const Token = require('../models/tokenModel');
const { fetchImages, getImage } = require('../utils/Images');

const userUpdateInfo = asyncHandler( async (req, res, next) => {
    const {email,...rest} = req.body;
    let emailMessage='';
    
    const user = await User.findOne({_id:req.params.id})
    if(!user || ! user._id.equals(req.user._id))
    {
        res.status(403)
        throw new Error(`Permission forbidden or no user found with this id "${req.params.id}"`)
    }
    
    if(email)
    {
        const token = await Token.create({
            userId:user._id,
            token:crypto.randomBytes(32).toString("hex"),
            type:"email"
        })    
        const url = `${process.env.BASE_URL}/email/${user._id}/verify/${token.token}`
        const htmlStr = `
        <h2>Verify your email address</h2>
        <p>To continue setting up your CafeX account,</p>
        <p>Please verify that this is your email address by clicking the link below:</p>
        `
        await sendEmail(email, 'CafeX - Verify your email',{htmlStr,url,btn:"Verify email address"})
        console.log("image6")
        emailMessage='An email sent to your email address please verify it to use the new email'
        data['newEmail'] = email;
    }
  
    const updatedUserInfo = await User.findOneAndUpdate({_id:user._id}, rest, {new: true})
    const updatedUser ={
        _id:updatedUserInfo._id,
        email:updatedUserInfo.email,
        name:updatedUserInfo.name, 
        phoneNumber:updatedUserInfo?.phoneNumber || '',
        role:updatedUserInfo.role,
        firstAddress:updatedUserInfo.firstAddress,
        secondAddress:updatedUserInfo.secondAddress,
        profileImage:updatedUserInfo.profileImage
    }
    if(updatedUser.role === 'owner')
    {
        const cafe = await Cafe.findOne({userId:updatedUserInfo._id})
        if(cafe)
        {
            cafe.ownerImage = updatedUserInfo.profileImage
            await cafe.save()
        }
    }

    res.status(200).json({message:`information has been updated, ${emailMessage} `,user:updatedUser})
})


const userUpdatePassword = asyncHandler(async (req, res, next) => {
    const {pass,oldPass} = req.body;
    const user = await User.findOne({_id:req.params.id})

    if(!user || ! user._id.equals(req.user._id))
    {
        res.status(403)
        throw new Error(`Permission forbidden or no user found with this id "${req.params.id}"`)
    }

    if(! await bcrypt.compare(oldPass, user.password))
    {
        res.status(400)
        throw new Error(`The old password is wrong please enter the valid one`)
    }
    const hashedPassword = await bcrypt.hash(pass, 10)

    user.password = hashedPassword

    await user.save()

    res.status(200).json({message:"Password has been updated"})
})

const getUser = asyncHandler( async(req, res, next) => {
    const id = req.params.id

    const user = await User.findOne({_id:id}).select('-password').populate({ path: 'imageId'}).exec();

    if(!user){
        res.status(404)
        throw new Error("No user with this id")
    }

    if(user.imageId.imageName){
        imageUrl = await getImage(user.imageId.imageName)
        if(imageUrl)
        {
            user.profileImage = imageUrl
            await user.save()
        }
    }
    const toChatUser = {
        userId:{
            name:user.name,
            profileImage:user.profileImage
        }
    }

    res.status(200).json({toChatUser})
})


const getChatUsers = asyncHandler( async(req, res, next) => {
    const id = req.params.id

    const user = await User.findOne({_id:id}).select('name email chatUsers'
        ).populate({path:'chatUsers.userId',select:'name eamil profileImage cafeId'})

    if(!user){
        res.status(404)
        throw new Error("No user with this id")
    }
    console.log(user.chatUsers)

    if(user.chatUsers.length === 0){
        return res.status(200).json({chatUsers:[]})
    }

    res.status(200).json({chatUsers: user.chatUsers})
})



module.exports = {userUpdateInfo, userUpdatePassword, getChatUsers, getUser}

