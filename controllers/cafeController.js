const asyncHandler = require('../middleware/tryCatch');
const Cafe = require('../models/cafeModel')
const Image = require('../models/imageModel');
const User = require('../models/userModel');
const crypto = require('crypto');
const { getImage, deleteImage, storeImage } = require('../utils/Images');


const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const cafeSwitch =asyncHandler( async (req, res, next) => {
    const {name, state, city, bio, address, phoneNumber} = req.body;
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

    if(!name || !city || !state || !bio || !address || !phoneNumber)
    {
        res.status(400)
        throw new Error("All fields are required")
    }

    const cafe = await Cafe.create({
        userId:user._id,
        name,
        ownerName:user.name,
        state,
        city,
        address,
        bio,
        phoneNumber
    })

    user.role = 'owner'
    await user.save()

    console.log(user)
    const updatedUser = {
        role:user.role
    } 

    res.status(201).json({message:'Cafe created successfully', cafe, user:updatedUser})
})


const getCafe = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const user = await User.findOne({_id:id})
    let cafeImage = ''
    
    if(!user)
    {
        res.status(404)
        throw new Error(`No user found with this "${id}" id`)
    }
    const cafe = await Cafe.findOne({userId:user._id})

    if(!cafe)
    {
        res.status(400)
        throw new Error(`The user doesnt have a cafe yet`)
    }

    if(cafe.image !== '')
        cafeImage = await getImage(cafe.image)

    if(cafeImage)
        cafe['image'] = cafeImage

    res.status(200).json({cafe})
})


const updateCafe = asyncHandler(async (req, res, next) => {
    const {image,...rest} = req.body;
    const file = req.file 

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

    let imageUrl = '';
    let cafeImage= '';

    if(file)
    {     
        const imageName = generateFileName()
        await storeImage(file, imageName)
       
        if(cafe.image)
            await deleteImage(cafe.image)

        cafe.image = imageName;
        await cafe.save()

        imageUrl = await getImage(imageName)
    }

    if(image === '')
    {
        if(cafe.image)
            await deleteImage(cafe.image)
        cafe.image = '';
        imageUrl = await cafe.save()
    }

    const updatedCafeInfo = await Cafe.findOneAndUpdate({_id:cafe._id}, rest, {new: true})

    if((!file && image !== '' && !image) && updatedCafeInfo.image !== '')
        cafeImage = await getImage(updatedCafeInfo.image)
    
    const updatedCafe ={
       ...updatedCafeInfo._doc,
        image:imageUrl?(file? imageUrl : imageUrl?.image ): cafeImage
    }

    res.status(200).json({message:`information has been updated`,cafe:updatedCafe})
})


const geAlltCafes = asyncHandler(async (req, res, next) => {
    const cafes = await Cafe.find()

    if(!cafes)
    {
        res.status(404)
        throw new Error("No cafes are avaialbe")
    }

    await Promise.all(cafes.map(async (cafe, index) => {
        const cafeImagePromise = await getImage(cafe.image)
            
        const userImagePromise = await getImage(cafe.userId.toString())

        const [cafeImage, userImage] = await Promise.all([cafeImagePromise,userImagePromise]);    

       cafe['ownerImage'] = userImage;
       cafe['image'] = cafeImage;
    }))
     

    res.status(200).json({cafes})
})



module.exports = {
    cafeSwitch,
    getCafe,
    updateCafe,
    geAlltCafes
}