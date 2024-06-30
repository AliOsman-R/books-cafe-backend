const User = require('../models/userModel')
const asyncHandler = require('../middleware/tryCatch');
const bcrypt = require('bcrypt')
const { generateVerifyEmail } = require('../utils/email');
const Cafe = require('../models/cafeModel')
const Book = require('../models/bookModel')
const Review = require('../models/reviewModel')
const Menu = require('../models/menuModel')
const Event = require('../models/eventModel')
const Cart = require('../models/cartModel')
const Image = require('../models/imageModel')
const Order = require('../models/orderModel')
const { getImage } = require('../utils/Images');

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
        const existentUser = await User.findOne({email})

        if(existentUser){
            res.status(403)
            throw new Error(`An existent user with this email, please use another one`)
        }

        await generateVerifyEmail({...user._doc, email})
        
        emailMessage='An email sent to your email address please verify it to use the new email'

        user['newEmail'] = email.toLowerCase();

        await user.save()
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
            profileImage:user.profileImage,
            _id:user._id
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

    if(user.chatUsers.length === 0){
        return res.status(200).json({chatUsers:[]})
    }

    const chatUsers = user?.chatUsers?.filter((chatUser => chatUser.userId))

    res.status(200).json({chatUsers})
})

const deleteAccount = asyncHandler( async(req, res, next) => {
    const id = req.params.id;

    const cafePromise = Cafe.findOne({ userId: id });
    const userPromise = User.findById(id);
    const ordersPromise = Order.find({ userId: id });

    const [cafe, user, orders] = await Promise.all([cafePromise, userPromise, ordersPromise]);

    if(!user || ! user._id.equals(req.user._id))
    {
        res.status(403)
        throw new Error(`Permission forbidden or no user found with this id "${req.params.id}"`)
    }

    for (const order of orders) {
        if (order.status === 'pending' || order.status === 'confirmed') {
            res.status(403);
            throw new Error("You can't delete the account as there are pending or confirmed orders. They must be delivered or cancelled first.");
        }
    }

    if (cafe) {
        const cafeOrders = await Order.find({ cafeId: cafe._id });
        
        for (const order of cafeOrders) {
            if (order.status === 'pending' || order.status === 'confirmed') {
                res.status(403);
                throw new Error("You can't delete the account as there are pending or confirmed orders in the cafe. They must be delivered or cancelled first.");
            }
        }

        await Promise.all([
            Cafe.deleteOne({ userId: id }),
            Book.deleteMany({ cafeId: cafe._id }),
            Menu.deleteMany({ cafeId: cafe._id }),
            Event.deleteMany({ cafeId: cafe._id }),
            Image.deleteOne({ _id: cafe.imageId }),
            // Order.deleteMany({ cafeId: cafe._id }),
        ]);
    }



    await Promise.all([
        Cart.deleteMany({ userId: id }),
        // Review.deleteMany({ userId: id }),
        Image.deleteOne({ _id: user.imageId }),
        // Order.deleteMany({ userId: id, sta }),
        User.deleteOne({_id:user._id})
    ]);

    res.status(200).json({ message: 'User and all associated data deleted' });
})


module.exports = {userUpdateInfo, userUpdatePassword, getChatUsers, getUser, deleteAccount}

