const User = require('../models/userModel')
const asyncHandler = require('../middleware/tryCatch');
const bcrypt = require('bcrypt')
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');
const Token = require('../models/tokenModel');
const { deleteImage, storeImage, getImage } = require('../utils/Images');


const userUpdateInfo = asyncHandler( async (req, res, next) => {
    const {profileImage,email,...rest} = req.body;
    const file = req.file 
    
    const user = await User.findOne({_id:req.params.id})
    if(!user || ! user._id.equals(req.user._id))
    {
        res.status(403)
        throw new Error(`Permission forbidden or no user found with this id "${req.params.id}"`)
    }
    const data ={...rest}
    let imageUrl = '';
    let userImage ='';
    let emailMessage='';
    

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

    if(file)
    {     
        const imageName = user._id.toString()

        await storeImage(file,imageName)

        if(user.profileImage)
            await deleteImage(user.profileImage)

        user.profileImage = imageName;
        await user.save()

        imageUrl = await getImage(imageName)
    }

    if(profileImage === '')
    {
        if(user.profileImage)
            await deleteImage(user.profileImage)
        user.profileImage = '';
        imageUrl = await user.save()
    }

    const updatedUserInfo = await User.findOneAndUpdate({_id:user._id}, data, {new: true})

    if((!file && profileImage !== '' && !profileImage) && updatedUserInfo.profileImage !== '')
        userImage = await getImage(updatedUserInfo.profileImage)

    
    const updatedUser ={
        _id:updatedUserInfo._id,
        email:updatedUserInfo.email,
        name:updatedUserInfo.name, 
        phoneNumber:updatedUserInfo?.phoneNumber || '',
        role:updatedUserInfo.role,
        profileImage:imageUrl?(file? imageUrl : imageUrl?.profileImage ): userImage
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



module.exports = {userUpdateInfo, userUpdatePassword}

