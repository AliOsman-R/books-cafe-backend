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

const eventSchema = mongoose.Schema({
   cafeId:{
    type:mongoose.Schema.Types.ObjectId,
    required:[true],
    ref:'Cafe'
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
   location:{
    type:String,
    required:true
   },
   description:{
    type:String,
    required:true
    },
   date:{
    type:Date,
    required:true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
   images:[imageSchema],
},
{
    timestamps:true
})

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema)