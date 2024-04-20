const asyncHandler = require('../middleware/tryCatch');
const mongoose = require('mongoose');
const Image = require('../models/imageModel');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
// const crypto = require('crypto');
const { getImage, deleteImage} = require('../utils/Images');


const getAllEvents = asyncHandler(async (req, res, next) => {
    const events = await Event.find().populate({path: 'images.imageId', select:'imageName'}).exec();

    await Promise.all(events.map(async (event) => {
        const imagePromises = event.images.map(async (image) => {
            if (image.imageId.imageName) {
                const eventImage = await getImage(image.imageId.imageName);
                image.url = eventImage;
            }
        });
        await Promise.all([...imagePromises]);
    }));
    
    await Promise.all(events.map(async (event) => {
        await event.save();
    }));

    res.status(200).json({ events });
})


const getCafeEvents = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const events = await Event.find({cafeId:id}).populate({path: 'images.imageId', select:'imageName'}).exec();

    await Promise.all(events.map(async (event) => {
        const imagePromises = event.images.map(async (image) => {
            if (image.imageId.imageName) {
                const eventImage = await getImage(image.imageId.imageName);
                image.url = eventImage;
            }
        });
        await Promise.all([...imagePromises]);
    }));
    
    await Promise.all(events.map(async (event) => {
        await event.save();
    }));

    res.status(200).json({ events });
})


const getUserEvents = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const events = await Event.find({userId:id}).populate({path: 'images.imageId', select:'imageName'}).exec();

    await Promise.all(events.map(async (event) => {
        const imagePromises = event.images.map(async (image) => {
            if (image.imageId.imageName) {
                const eventImage = await getImage(image.imageId.imageName);
                image.url = eventImage;
            }
        });
        await Promise.all([...imagePromises]);
    }));
    
    await Promise.all(events.map(async (event) => {
        await event.save();
    }));

    res.status(200).json({ events });
})


const getEvent = asyncHandler(async (req, res, next) => {


})


const addEvent = asyncHandler(async (req, res, next) => {
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

    const createdEvent = await Event.create({
        ...req.body,
        images:newImages,
        userId:user._id,
        cafeId:user.cafeId._id})

    const event = await Event.findOne({_id:createdEvent._id}).populate({path: 'images.imageId', select:'imageName'}).exec();

    const imagePromises = event.images.map(async (image) => {
        if (image.imageId.imageName) {
            const eventImage = await getImage(image.imageId.imageName);
            image.url = eventImage;
        }
    });

    await Promise.all([...imagePromises]);

    await event.save()    
    
    res.status(201).json({ message: 'Event item added successfully', event });
})


const updateEvent = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const images = req.body.images || []
    const eventData = req.body
    let newImages = []

    if(images.length > 0)
    {
        newImages = req.body.images.map((imgId) => ({imageId:new  mongoose.Types.ObjectId(imgId)}) )
        eventData['images'] = newImages
    }

    const updatedEvent = await Event.findOneAndUpdate({ _id: id }, eventData, {new: true})

    if(!updatedEvent)
    {
        res.status(404);
        throw new Error(`No event found with this id ${id}`);
    }

    const event = await Event.findOne({_id:updatedEvent._id}).populate({path: 'images.imageId', select:'imageName'}).exec()
    
    const imagePromises = event.images.map(async (image) => {
        if (image.imageId.imageName) {
            const eventImage = await getImage(image.imageId.imageName);
            image.url = eventImage;
        }
    });

    await Promise.all([...imagePromises]);

    await event.save()

    res.status(200).json({ message: 'Event updated successfully', event });
})


const deleteEvent =  asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const event = await Event.findOne({_id:id}).populate({path: 'images.imageId', select:'imageName'}).exec();

    if(!event)
    {
        res.status(404);
        throw new Error(`No event found with this id ${id}`);
    }

    const imagePromises = event.images.map(async (image) => {
        let eventImagePromise;
        if (image.imageId.imageName) {
            eventImagePromise = deleteImage(image.imageId.imageName);
        }
        const deletedImage = Image.findOneAndDelete({_id:image.imageId._id})

        await Promise.all([deletedImage, eventImagePromise]);

    });

    await Promise.all([...imagePromises]);

    await Event.deleteOne({_id:event._id})

    res.status(200).json({ message: 'The Event deleted successfully' });

})


module.exports = {
    getCafeEvents,
    getUserEvents,
    addEvent,
    getEvent,
    updateEvent,
    deleteEvent,
    getAllEvents
}