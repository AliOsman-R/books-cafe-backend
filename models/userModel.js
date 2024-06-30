const mongoose = require('mongoose')

const chatUsersSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:false,
        ref:'User',
    },
    date: {
        type:Date,
        default:new Date()
    },
    lastMessage:{
        type:String,
        default:''
    }
})

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    newEmail:{
        type:String,
        unique:true,
        default:''
    },
    password:{
        type:String,
        required:true,
    },
    phoneNumber:{
        type:String,
        required:false,
        default:''
    },
    role:{
        type:String,
        required:true,
    },
    newEmail:{
        type:String,
        required:false,
    },
    profileImage:{
        type:String,
        required:false,
        default:''
    },
    imageId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Image'
    },
    cafeId:{
        type:mongoose.Schema.Types.ObjectId,
        required:false,
        ref:'Cafes'
    },
    firstAddress:{
        type:String,
        required:false,
        default:''
    },
    secondAddress:{
        type:String,
        required:false,
        default:''
    },
    verified:{
        type:Boolean,
        default:false
    },
    chatUsers:[chatUsersSchema]
},
{
    timestamps:true
})

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema)