const mongoose = require('mongoose')

const workingDaysSchema = mongoose.Schema({
    day: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    isOpen: {
        type: Boolean,
        required: true
    }
});

const cafeSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    name:{
        type:String,
        required: true
    },
    ownerName:{
        type:String,
        required: true,
    },
    bio:{
        type:String,
        required:false
    },
    phoneNumber:{
        type:String,
        required:true,
    },
    address:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    imageId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Image'
    },
    image:{
        type:String,
        required:false,
        default:''
    },
    ownerImage:{
        type:String,
        required:false,
        default:''
    },
    coordinates: { 
        type: [Number],  // [longitude, latitude]
        index: '2dsphere',
        required: true
    },
    workingDays: [workingDaysSchema],
    averageRating: {
        type: Number,
        default: 0  
    },
    orderMethods: {
        pickUpAtCafe: {
            type: Boolean,
            default: false
        },
        delivery: {
            type: Boolean,
            default: false
        }
    },
    deliveryEst: {
        type: String,
        default: ''  
    },
    deliveryFee: {
        type: Number,
        default: 0  
    },
    isDeleted: { type: Boolean, default: false },
},
{
    timestamps:true
})

cafeSchema.set('toJSON', { virtuals: true });
cafeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cafes', cafeSchema)

