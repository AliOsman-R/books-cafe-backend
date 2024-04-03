const mongoose = require('mongoose')

const imageSchema = mongoose.Schema({
    image:{
        type:String,
        required:[false],
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:[false],
        ref:'User'
    },
    cafeId:{
        type:mongoose.Schema.Types.ObjectId,
        required:[false],
        ref:'Cafe'
    },
    type:{
        type:String,
        required:[true],
    },
    contentType:{
        type:String,
        required:[false],
    }
},
{
    timestamps:true
})

module.exports = mongoose.model('Image', imageSchema)