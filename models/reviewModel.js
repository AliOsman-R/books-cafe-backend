const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  comment: {
    type:String,
    default:''
  },
  productName:{
    type:String,
    required: false,
    default:''
  },
  customerName:{
    type:String,
    required:true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cafeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafes',
    required: true
  },
  reviewableId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reviewableType: {
    type: String,
    required: true,
    enum: ['cafe', 'books', 'menu']
  }
}, { timestamps: true });

reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema)
