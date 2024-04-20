const mongoose = require('mongoose')

const imageSchema = mongoose.Schema({
    imageName:{
        type:String,
        required:false,
        default:''
    },
},
{
    timestamps:true
})


module.exports = mongoose.model('Image', imageSchema)