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
    },
}) 

const menuSchema = mongoose.Schema({
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
    name:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:false,
        enum: ['Available', 'Not Available']
    },
    // isCountable: {
    //     type:Boolean,
    //     required:true,
    // },
    type:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    ingredients:{
        type:[String],
        required:true
    },
    description:{
        type:String,
        required:true
    },
    averageRating: {
        type: Number,
        default: 0  
    },
    stock:{
        type:Number,
        required:false,
        default:0
    },
    images:[imageSchema],
},
{
    timestamps:true
})

menuSchema.set('toJSON', { virtuals: true });
menuSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Menu', menuSchema)