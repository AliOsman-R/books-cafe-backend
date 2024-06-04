const mongoose = require('mongoose')

const conversationSchema = mongoose.Schema({
    participants: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        }
    ],
    messages:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Message',
            default:[]
        }
    ]
},
{
    timestamps:true
})

conversationSchema.set('toJSON', { virtuals: true });
conversationSchema.set('toObject', { virtuals: true });


module.exports = mongoose.model('Conversation', conversationSchema)