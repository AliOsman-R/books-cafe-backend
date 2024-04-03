const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required: [true]
    },
    email:{
        type:String,
        required:[true],
        unique:true
    },
    password:{
        type:String,
        required:[true]
    },
    phoneNumber:{
        type:String,
        required:[false],
    },
    role:{
        type:String,
        required:[true],
    },
    newEmail:{
        type:String,
        required:[false],
    },
    profileImage:{
        type:String,
        required:[false],
        default:''
    },
    firstAddress:{
        type:String,
        required:[false],
        default:''
    },
    secondAddress:{
        type:String,
        required:[false],
        default:''
    },
    // cafeId:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     required: function() {
    //         return this.role === 'owner';
    //     },
    //     default:null
    //     // ref:'Cafe'
    // },
    verified:{
        type:Boolean,
        default:false
    }
},
{
    timestamps:true
})

module.exports = mongoose.model('User', userSchema)