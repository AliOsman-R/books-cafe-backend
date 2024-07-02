const asyncHandler = require('../middleware/tryCatch');
const Review = require('../models/reviewModel');
const Cafe = require('../models/cafeModel');
const Menu = require('../models/menuModel');
const Book = require('../models/bookModel');


const getReviews = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const reviews = await Review.find({reviewableId:id}).populate({path:"userId", select:"name"}).exec();

    res.status(200).json({reviews})
})

const getUserReviews = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const reviews = await Review.find({userId:id}).populate({path:"userId", select:"name"}).exec();

    res.status(200).json({reviews})
})

const getCafeReviews = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const reviews = await Review.find({cafeId:id}).populate({path:"userId", select:"name"}).exec();

    res.status(200).json({reviews})
})

const postReview = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const {reviewableId, reviewableType, userId, cafeId, rating, productName} = req.body

    if(!userId || !rating || !reviewableId || !reviewableType || !cafeId)
    {
        res.status(400)
        throw new Error("Please make sure all required fields provided")
    }

    const foundReviewPromise = Review.findOne({reviewableId, userId})
    
    const itemPromise = (reviewableType === 'menu' ? Menu.findOne({_id: reviewableId}) : reviewableType === 'books'?
     Book.findOne({_id: reviewableId}) : Cafe.findOne({_id: reviewableId}))

    const [foundReview, item] = await Promise.all([foundReviewPromise, itemPromise])

    if(foundReview)
    {   
        res.status(400)
        throw new Error(`The review has been already recorded before for this "${productName}". You can view your review in My reviews page`)
    }
    
    const review = await Review.create(({
        ...req.body,
    }))

    if(item)
    {
        const totalReviews = item.numOfReviews || 0;
        const currentAverageRating = item.averageRating || 0;
        
        let newAverageRating = ((currentAverageRating * totalReviews) + rating) / (totalReviews + 1);
        newAverageRating = Math.round(newAverageRating * 2) / 2;

        newAverageRating = Math.max(0, Math.min(5, newAverageRating));

        item.averageRating = newAverageRating;
        item.numOfReviews = totalReviews + 1;
        await item.save();
    }
    

    res.status(200).json({message: 'Review has been recorded successfully', review})
})

const updateReview = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const {rating, comment, oldRating, reviewableId, reviewableType} = req.body

    const updatedReview = await Review.findOneAndUpdate(
        { _id: id },
        { $set: { rating, comment } },
        { new: true }  
      );

    if(oldRating !== rating)
    {
        const item = await (reviewableType === 'menu' ? Menu.findOne({_id: reviewableId}) : reviewableType === 'books'?
        Book.findOne({_id: reviewableId}) : Cafe.findOne({_id: reviewableId}))

        if(item)
        {
            const totalReviews = item.numOfReviews || 0;
            const currentAverageRating = item.averageRating || 0;
            let newAverageRating
            if (totalReviews === 1) {
                newAverageRating = rating;
            } else {
                newAverageRating = ((currentAverageRating * totalReviews) - oldRating + rating) / totalReviews;
            }
            //  = ((currentAverageRating * totalReviews) - oldRating + rating) / (totalReviews);
            newAverageRating = Math.round(newAverageRating * 2) / 2;
            newAverageRating = Math.max(0, Math.min(5, newAverageRating));

            item.averageRating = newAverageRating;
            await item.save();
        }
    }

    if (!updatedReview) {
        res.status(404)
        throw new Error('Review not found.');
    }

    res.status(200).json({message: 'Review has been updated successfully', review:updatedReview})

})


module.exports = {
    getReviews,
    postReview,
    getUserReviews,
    getCafeReviews,
    updateReview
}