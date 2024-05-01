const asyncHandler = require('../middleware/tryCatch');
const mongoose = require('mongoose');
const Image = require('../models/imageModel');
const User = require('../models/userModel');
const Menu = require('../models/menuModel');
// const crypto = require('crypto');
const { deleteImages, fetchImages} = require('../utils/Images');


const getCafeMenu = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const menu = await Menu.find({cafeId:id}).populate({path: 'images.imageId', select:'imageName'}).exec();

    await fetchImages(menu)

    res.status(200).json({ menu });
})


const getUserMenu = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    if(req.user._id !== id)
    {
        res.status(403)
        throw new Error("Forbidden")
    }
    
    const menu = await Menu.find({userId:id}).populate({path: 'images.imageId', select:'imageName'}).exec();

    await fetchImages(menu)

    res.status(200).json({ menu });
})


const addMenuItem = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const user = await User.findOne({_id:id}).populate({path:'cafeId', select:"_id"}).exec();

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (!user.cafeId) {
        res.status(404);
        throw new Error("No cafe found for this user");
    }
    const newImages = req.body.images.map((imgId) => ({imageId:new  mongoose.Types.ObjectId(imgId)}) )

    const createdMenuItem = await Menu.create({
        ...req.body,
        images:newImages,
        userId:user._id,
        cafeId:user.cafeId._id})

    const menuItem = await createdMenuItem.populate({path: 'images.imageId', select:'imageName'})

    await fetchImages(menuItem)
      
    
    res.status(201).json({ message: 'Menu item added successfully', menuItem });
})


const updateMenuItem = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const images = req.body.images || []
    const menuItemData = req.body
    let newImages = []

    if(images.length > 0)
    {
        newImages = req.body.images.map((imgId) => ({imageId:new  mongoose.Types.ObjectId(imgId)}) )
        menuItemData['images'] = newImages
    }

    const updatedMenuItem = await Menu.findOneAndUpdate({ _id: id }, menuItemData, {new: true})

    if(!updatedMenuItem)
    {
        res.status(404);
        throw new Error(`No menu item found with this id ${id}`);
    }

    const menuItem = await updatedMenuItem.populate({path: 'images.imageId', select:'imageName'})
    
    await fetchImages(menuItem)

    res.status(200).json({ message: 'Menu updated successfully', menuItem });
})


const deleteMenuItem =  asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const menuItem = await Menu.findOne({_id:id}).populate({path: 'images.imageId', select:'imageName'}).exec();

    if(!menuItem)
    {
        res.status(404);
        throw new Error(`No menu item found with this id ${id}`);
    }

    await deleteImages(menuItem, 'images')

    await Menu.deleteOne({_id:menuItem._id})

    res.status(200).json({ message: 'Menu item deleted successfully' });

})


module.exports = {
    getCafeMenu,
    getUserMenu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
}