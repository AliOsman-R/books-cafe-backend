const asyncHandler = require('../middleware/tryCatch');
const mongoose = require('mongoose');
const Image = require('../models/imageModel');
const User = require('../models/userModel');
const Menu = require('../models/menuModel');
// const crypto = require('crypto');
const { getImage, deleteImage} = require('../utils/Images');


const getCafeMenu = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const menu = await Menu.find({cafeId:id}).populate({path: 'images.imageId', select:'imageName'}).exec();

    await Promise.all(menu.map(async (menuItem) => {
        const imagePromises = menuItem.images.map(async (image) => {
            if (image.imageId.imageName) {
                const menuItemImage = await getImage(image.imageId.imageName);
                image.url = menuItemImage;
            }
        });
        await Promise.all([...imagePromises]);
    }));
    
    await Promise.all(menu.map(async (menuItem) => {
        await menuItem.save();
    }));

    res.status(200).json({ menu });
})

const getUserMenu = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const menu = await Menu.find({userId:id}).populate({path: 'images.imageId', select:'imageName'}).exec();

    await Promise.all(menu.map(async (menuItem) => {
        const imagePromises = menuItem.images.map(async (image) => {
            if (image.imageId.imageName) {
                const menuItemImage = await getImage(image.imageId.imageName);
                image.url = menuItemImage;
            }
        });
        await Promise.all([...imagePromises]);
    }));
    
    await Promise.all(menu.map(async (menuItem) => {
        await menuItem.save();
    }));

    res.status(200).json({ menu });
})


const getMenuItem = asyncHandler(async (req, res, next) => {


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

    const menuItem = await Menu.findOne({_id:createdMenuItem._id}).populate({path: 'images.imageId', select:'imageName'}).exec();

    const imagePromises = menuItem.images.map(async (image) => {
        if (image.imageId.imageName) {
            const menuItemImage = await getImage(image.imageId.imageName);
            image.url = menuItemImage;
        }
    });

    await Promise.all([...imagePromises]);

    await menuItem.save()    
    
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

    const menuItem = await Menu.findOne({_id:updatedMenuItem._id}).populate({path: 'images.imageId', select:'imageName'}).exec()
    
    const imagePromises = menuItem.images.map(async (image) => {
        if (image.imageId.imageName) {
            const menuItemImage = await getImage(image.imageId.imageName);
            image.url = menuItemImage;
        }
    });

    await Promise.all([...imagePromises]);

    await menuItem.save()

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

    const imagePromises = menuItem.images.map(async (image) => {
        let menuItemImagePromise;
        if (image.imageId.imageName) {
            menuItemImagePromise = deleteImage(image.imageId.imageName);
        }
        const deletedImage = Image.findOneAndDelete({_id:image.imageId._id})

        await Promise.all([deletedImage, menuItemImagePromise]);

    });

    await Promise.all([...imagePromises]);

    await Menu.deleteOne({_id:menuItem._id})

    res.status(200).json({ message: 'Menu item deleted successfully' });

})


module.exports = {
    getCafeMenu,
    getUserMenu,
    addMenuItem,
    getMenuItem,
    updateMenuItem,
    deleteMenuItem
}