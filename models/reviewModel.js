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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewableId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reviewableType: {
    type: String,
    required: true,
    enum: ['Cafe', 'Book', 'Menu']
  }
}, { timestamps: true });

reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema)
