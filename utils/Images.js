const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, } = require("@aws-sdk/client-s3")
const fs = require('fs');
const { s3 } = require('../config/dbConnection');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
// const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')
const bucketName = process.env.BUKET_NAME

exports.getImage = async (imageName)  => {
    try{
        const imageUrl = await getSignedUrl(s3,
            new GetObjectCommand({
              Bucket: bucketName,
              Key: imageName
            }))
        return imageUrl
    }
    catch (err){
        console.log(err)
    }
}


exports.storeImage = async (file,imageName) => {
    try{
        const fileBuffer = fs.readFileSync(file.path);
        // Remove the temporary file after reading
        fs.unlinkSync(file.path);

        const uploadParams = {
            Bucket: bucketName,
            Body: fileBuffer,
            Key: imageName,
            ContentType: file.mimetype
        }

        await s3.send(new PutObjectCommand(uploadParams));
        return imageName
    }catch(err) {
        console.log(err)
    }
}

exports.deleteImage = async (imageName) => {
    try{
        const deleteParams = {
            Bucket: bucketName,
            Key: imageName,
        }
        
        await s3.send(new DeleteObjectCommand(deleteParams))
    }catch(err) {
        console.log(err)
    }
}