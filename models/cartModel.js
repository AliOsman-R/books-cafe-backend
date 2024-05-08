const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    cafeId:{
        type:mongoose.Schema.Types.ObjectId,
        required:[true],
        ref:'Cafes'
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    productName:{
        type:String,
        required: true,
    },
    type:{
        type:String,
        required: true,
        enum:['books', 'menu']
    },
    quantity:{
        type:Number,
        required:true
    }
 
}, { timestamps: true });

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema)
