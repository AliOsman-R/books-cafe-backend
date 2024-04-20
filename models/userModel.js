const mongoose = require('mongoose')

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
    password:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:false,
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
    }
},
{
    timestamps:true
})

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema)