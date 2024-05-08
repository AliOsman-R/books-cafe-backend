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

const progressSchema = mongoose.Schema({
    activity:{
        type:String,
        required:true,
        enum: ['orderPlaced','preparing', 'outForDelivery', 'delivered']
    },
    time:{
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
})

const productSchema = mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    type:{
        type:String,
        required:true,
        enum:['books', 'menu']
    },
    quantity:{
        type:Number,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    item: {
        type:Object,
        required:false,
    },
    images:[imageSchema]
})

const orderSchema = mongoose.Schema({
    cafeId:{
        type:mongoose.Schema.Types.ObjectId,
        required:[true],
        ref:'Cafes'
    },
    orderId:{
        type:String,
        required:true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:[true],
        ref:'User'
    },
    products:[productSchema],
    status:{
        type:String,
        required:true,
        enum: ['pending',  'confirmed', 'cancelled', 'completed']
    },
    progress:[progressSchema],
    totalPrice:{
        type:Number,
        required:true
    },
    deliveryFee: {
        type:Number,
        required:true,
        default:0
    },
    sstAmount: {
        type:Number,
        required:true,
    },
    phoneNumber: {
        type:String,
        required:true,
    },
    lastFourDigits: {
        type:String,
        required:true,
    },
    firstAddress:{
        type:String,
        required:true,
    },
    secondAddress:{
        type:String,
        required:true,
    },
    specialRequest:{
        type:String,
        required:false,
        default:''
    }

},
{
    timestamps:true
})

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema)