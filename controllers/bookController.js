const asyncHandler = require('../middleware/tryCatch');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Book = require('../models/bookModel');
const { deleteImages} = require('../utils/Images');
const { getBooksImages } = require('../utils/bookUtils');

const getCafebooks = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const books = await Book.find({cafeId:id})
    .populate({path: 'images.imageId bookPlaceImages.imageId cafeId', 
    select:'imageName orderMethods deliveryFee deliveryEst'}).exec();

    await Promise.all(books.map(async (book) => {
        await getBooksImages(book)
    }));
    
    await Promise.all(books.map(async (book) => {
        await book.save();
    }));

    res.status(200).json({ books });
})

const getUserbooks = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    
    if(req.user._id !== id)
    {
        res.status(403)
        throw new Error("Forbidden")
    }

    const books = await Book.find({userId:id})
    .populate({path: 'images.imageId bookPlaceImages.imageId', select:'imageName'}).exec();

    await Promise.all(books.map(async (book) => {
        await getBooksImages(book)
    }));
    
    await Promise.all(books.map(async (book) => {
        await book.save();
    }));

    res.status(200).json({ books });
})

const addBook = asyncHandler(async (req, res, next) => {
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
    const newPlaceImages = req.body.bookPlaceImages.map((imgId) => ({imageId:new  mongoose.Types.ObjectId(imgId)}) )

    const createdBook = await Book.create({
        ...req.body,
        images:newImages,
        bookPlaceImages:newPlaceImages,
        userId:user._id,
        cafeId:user.cafeId._id})

    const book = await Book.findOne({_id:createdBook._id})
    .populate({path: 'images.imageId bookPlaceImages.imageId', select:'imageName'}).exec();

    await getBooksImages(book)

    await book.save()    
    
    res.status(201).json({ message: 'Book added successfully', book });
})

const updateBook = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const images = req.body.images || []
    const bookPlaceImages = req.body.bookPlaceImages || []
    const bookData = req.body
    let newImages = []
    let newPlaceImages = []

    if(images.length > 0)
    {
        newImages = req.body.images.map((imgId) => ({imageId:new  mongoose.Types.ObjectId(imgId)}) )
        bookData['images'] = newImages
    }

    if(bookPlaceImages.length > 0)
    {
        newPlaceImages = req.body.bookPlaceImages.map((imgId) => ({imageId:new  mongoose.Types.ObjectId(imgId)}) )
        bookData['bookPlaceImages'] = newPlaceImages
    }

    const updatedBook = await Book.findOneAndUpdate({ _id: id }, bookData, {new: true})

    if(!updatedBook)
    {
        res.status(404);
        throw new Error(`No book found with this id ${id}`);
    }

    const book = await Book.findOne({_id:updatedBook._id})
    .populate({path: 'images.imageId bookPlaceImages.imageId', select:'imageName'}).exec()
    
    
    await getBooksImages(book)

    await book.save()

    res.status(200).json({ message: 'Book updated successfully', book });
})

const deleteBook =  asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const book = await Book.findOne({_id:id})
    .populate({path: 'images.imageId bookPlaceImages.imageId', select:'imageName'}).exec();

    if(!book)
    {
        res.status(404);
        throw new Error(`No book found with this id ${id}`);
    }

    const imagePromises = deleteImages(book, 'images')

    const bookPlaceImagePromises = deleteImages(book, 'bookPlaceImages')

    await Promise.all([imagePromises, bookPlaceImagePromises]);

    await Book.deleteOne({_id:book._id})

    res.status(200).json({ message: 'Book deleted successfully' });

})


module.exports = {
    getCafebooks,
    getUserbooks,
    addBook,
    updateBook,
    deleteBook
}