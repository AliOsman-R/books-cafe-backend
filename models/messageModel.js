const mongoose = require('mongoose')

const messageSchema = mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    message:{
        type:String,
        required:true
    }
},
{
    timestamps:true
})

messageSchema.set('toJSON', {virtuals:true})
messageSchema.set('toObject', {virtuals:true})


module.exports = mongoose.model('Message', messageSchema)