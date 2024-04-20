const asyncHandler = require('../middleware/tryCatch');
const Cafe = require('../models/cafeModel')
const Image = require('../models/imageModel');
const User = require('../models/userModel');
// const crypto = require('crypto');
const { getImage} = require('../utils/Images');

const cafeSwitch =asyncHandler( async (req, res, next) => {
    const {name, state, city, bio, address, phoneNumber, latitude, longitude, workingDays} = req.body;
    const id = req.params.id
    const user = await User.findOne({_id:id})

    if(!user)
    {
        res.status(404)
        throw new Error(`No user found with this "${id}" id`)
    }

    const hasCafe = await Cafe.findOne({userId:id})

    if(hasCafe)
    {
        res.status(400)
        throw new Error(`A cafe already exists`)
    }

    if(!name || !city || !state || !bio || !address || !phoneNumber || !longitude ||!latitude)
    {
        res.status(400)
        throw new Error("All fields are required")
    }

    const image = await Image.create({imageName:''})

    const cafe = await Cafe.create({
        userId:user._id,
        name,
        ownerName:user.name,
        ownerImage:user.profileImage,
        state,
        city,
        address,
        bio,
        imageId:image._id,
        phoneNumber,
        coordinates:{
            latitude,
            longitude
        },
        workingDays
    })

    user.role = 'owner'
    user.cafeId = cafe._id
    const updatedUserInfo =await user.save()
    
    const updatedUser = {
        role:updatedUserInfo.role
    } 

    res.status(201).json({message:'Cafe created successfully', cafe, user:updatedUser})
})


const getUserCafe = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const user = await User.findOne({_id:id})
    
    if(!user)
    {
        res.status(404)
        throw new Error(`No user found with this "${id}" id`)
    }
    const cafe = await Cafe.findOne({userId:user._id}).populate({ path: 'imageId'}).exec();

    if(!cafe)
    {
        res.status(400)
        throw new Error(`The user doesnt have a cafe yet`)
    }

    if(cafe.imageId.imageName)
    {
        imageUrl = await getImage(cafe.imageId.imageName)
        if(imageUrl)
        {
            cafe.image = imageUrl
            await cafe.save()
        }
    }

    cafe['imageId'] = cafe.imageId._id

    res.status(200).json({cafe})
})


const getCafeById = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const cafe = await Cafe.findOne({_id:id}).populate({path:'userId imageId', select:"imageId name profileImage imageName"}).exec();

    if(!cafe)
    {
        res.status(400)
        throw new Error(`The user doesnt have a cafe yet`)
    }

    const foundUserImage  = await Image.findOne({_id:cafe.userId.imageId})
    let cafeImagePromise, userImagePromise
    if(cafe.imageId.imageName)
    {
        cafeImagePromise = getImage(cafe.imageId.imageName)
    }
    if(foundUserImage.imageName)
    {
        userImagePromise = getImage(foundUserImage.imageName)
    }
    const [cafeImage, userImage] = await Promise.all([cafeImagePromise, userImagePromise]);    

    cafe['image'] = cafeImage || '';
    cafe['ownerImage'] = userImage || '';
    cafe['ownerName'] = cafe.userId.name

    res.status(200).json({cafe})
})


const updateCafe = asyncHandler(async (req, res, next) => {
    const cafeData = req.body;
    const user = await User.findOne({_id:req.params.id})
    
    if(!user || ! user._id.equals(req.user._id))
    {
        res.status(403)
        throw new Error(`Permission forbidden or no user found with this id "${req.params.id}"`)
    }
    const cafe = await Cafe.findOne({userId:user._id})

    if(!cafe)
    {
        res.status(400)
        throw new Error(`The user doesnt have a cafe yet`)
    }
    
    const updatedCafe = await Cafe.findOneAndUpdate({_id:cafe._id}, cafeData, {new: true})

    res.status(200).json({message:`information has been updated`,cafe:updatedCafe})
})


const geAlltCafes = asyncHandler(async (req, res, next) => {
    const cafes = await Cafe.find().populate({path:'userId imageId', select:"imageId name profileImage imageName"}).exec();

    if(cafes?.length === 0)
    {
        res.status(404)
        throw new Error("No cafes are avaialbe")
    }

    await Promise.all(cafes.map(async (cafe) => {
        const foundUserImage  = await Image.findOne({_id:cafe.userId.imageId})
        let cafeImagePromise, userImagePromise
        if(cafe.imageId.imageName)
        {
            cafeImagePromise = getImage(cafe.imageId.imageName)
        }
        if(foundUserImage.imageName)
        {
            userImagePromise = getImage(foundUserImage.imageName)
        }
        const [cafeImage, userImage] = await Promise.all([cafeImagePromise, userImagePromise]);    

        cafe['image'] = cafeImage || '';
       cafe['ownerImage'] = userImage || '';
       cafe['ownerName'] = cafe.userId.name
    }))
    res.status(200).json({cafes})
})



module.exports = {
    cafeSwitch,
    getUserCafe,
    updateCafe,
    geAlltCafes,
    getCafeById
}