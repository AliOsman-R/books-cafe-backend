const asyncHandler = require('../middleware/tryCatch');
const mongoose = require('mongoose');
const Image = require('../models/imageModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
// const crypto = require('crypto');
const { getImage, deleteImage} = require('../utils/Images');


const getReviews = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const reviews = await Review.find({reviewableId:id}).populate({path:"userId", select:"name"}).exec();
    console.log(reviews)

    res.status(200).json({reviews})
})


const postReview = asyncHandler(async (req, res, next) => {

})



module.exports = {
    getReviews,
    postReview
}