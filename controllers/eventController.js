const asyncHandler = require('../middleware/tryCatch');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
const { fetchImages, deleteImages} = require('../utils/Images');

const getAllEvents = asyncHandler(async (req, res, next) => {
    const events = await Event.find()
    .populate({path: 'images.imageId cafeId', select:'imageName name'}).exec();

    await fetchImages(events)

    res.status(200).json({ events });
})

const getCafeEvents = asyncHandler(async (req, res, next) => {
    const id = req.params.id

    const events = await Event.find({cafeId:id})
    .populate({path: 'images.imageId', select:'imageName'}).exec();

    await fetchImages(events)

    res.status(200).json({ events });
})

const getUserEvents = asyncHandler(async (req, res, next) => {
    const id = req.params.id

    if(req.user._id !== id)
    {
        res.status(403)
        throw new Error("Forbidden")
    }
    
    const events = await Event.find({userId:id}).populate({path: 'images.imageId', select:'imageName'}).exec();

    await fetchImages(events)

    res.status(200).json({ events });
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

    const event = await createdEvent.populate({path: 'images.imageId', select:'imageName'})

    await fetchImages(event) 
    
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

    const event = await updatedEvent.populate({path: 'images.imageId', select:'imageName'})
    
    await fetchImages(event)

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

    await deleteImages(event, 'images')

    await Event.deleteOne({_id:event._id})

    res.status(200).json({ message: 'The Event deleted successfully' });

})


module.exports = {
    getCafeEvents,
    getUserEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    getAllEvents
}