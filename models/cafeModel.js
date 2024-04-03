const mongoose = require('mongoose')

const coordinatesSchema = mongoose.Schema({
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false }
});

const cafeSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:[true],
        ref:'User'
    },
    name:{
        type:String,
        required: [true]
    },
    ownerName:{
        type:String,
        required: [true]
    },
    bio:{
        type:String,
        required:[false]
    },
    phoneNumber:{
        type:String,
        required:[true],
    },
    address:{
        type:String,
        required:[true]
    },
    state:{
        type:String,
        required:[true]
    },
    city:{
        type:String,
        required:[true]
    },
    image:{
        type:String,
        required:[false],
        default:''
    },
    ownerImage:{
        type:String,
        required:[false],
        default:''
    },
    coordinates: {
        type: coordinatesSchema,
        required: false
    },    
},
{
    timestamps:true
})

module.exports = mongoose.model('Cafes', cafeSchema)

