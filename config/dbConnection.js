const { S3Client } = require('@aws-sdk/client-s3');
const mongoose = require('mongoose');


const connectDb = async () => {
    try{
        const connect = await mongoose.connect(process.env.MONGODB_CONNECTION)
        console.log('db connected: ', connect.connection.host)
    }
    catch(err){
        console.log("error: ",err)
        process.exit(1)
        // throw new Error("mongon error")
    }
}

const region = process.env.BUKET_REGIN
const accessKeyId = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY
  
const s3 = new S3Client({
    region,
    credentials: {
    accessKeyId,
    secretAccessKey
    }
})


module.exports = {connectDb, s3};