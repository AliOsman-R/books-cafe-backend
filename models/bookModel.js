const mongoose = require('mongoose')

const imageSchema = mongoose.Schema({
    imageId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Image'
    },
    url:{
        type:String,
        default:''
    }
}) 

const bookSchema = mongoose.Schema({
    cafeId:{
        type:mongoose.Schema.Types.ObjectId,
        required:[true],
        ref:'Cafes'
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:[true],
        ref:'User'
    },
    title:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    genre:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required: function() {
            return this.availability === 'selling'; // Price is required if availability is 'selling'
        },
    },
    description:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        required: function() {
            return this.availability === 'Selling'; // Stock is required if availability is 'Selling'
        },
        default: 0
    },
    publishYear:{
        type:Number,
        required:true
    },
    averageRating: {
        type: Number,
        default: 0  
    },
    availability:{
        type:String,
        required:true,
        enum:['Reading', 'Selling'],
        default:'Selling'
    },
    status:{
        type:String,
        required: function() {
            return this.availability === 'Reading'; // Stock is required if availability is 'Reading'
        },
        validate: {
            validator: function(value) {
                return !(this.availability === 'Reading' && !value); // Stock should exist if availability is 'Reading'
            },
            message: 'isAvailable is required if the book is for reading.'
        },
        enum:['Available', 'Not Available'],
    },
    images:[imageSchema],
    bookPlaceImages:[imageSchema]
},
{
    timestamps:true
})

bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema)