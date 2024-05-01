const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
 
}, { timestamps: true });

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema)
