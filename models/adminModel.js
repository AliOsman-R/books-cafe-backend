const mongoose = require('mongoose')

const adminSchema = mongoose.Schema({
    userName:{
        type:String,
        required: true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
},
{
    timestamps:true
})

adminSchema.set('toJSON', { virtuals: true });
adminSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Admin', adminSchema)