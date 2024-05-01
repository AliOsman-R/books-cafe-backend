const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, } = require("@aws-sdk/client-s3")
const fs = require('fs');
const { s3 } = require('../config/dbConnection');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const Image = require("../models/imageModel");
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

exports.fetchImages = async (input) => {
    // Determine if the input is an array of objects or a single object
    const isMultiple = Array.isArray(input);
    const objects = isMultiple ? input : [input];

    const imagesPromises = objects.map(async (obj) => {
        const imagePromises = obj.images.map(async (image) => {
            if (image.imageId && image.imageId.imageName) {
                return this.getImage(image.imageId.imageName);
            }
        });
        return await Promise.all(imagePromises);
    });

    const imagesUrl = await Promise.all(imagesPromises);

    await Promise.all(objects.map(async (obj, index) => {
        obj.images.forEach((image, i) => {
            if (imagesUrl[index][i]) {
                image.url = imagesUrl[index][i];
            }
        });
        await obj.save();
    }));

    // If the input was a single object, return it directly
    if (!isMultiple) {
        return objects[0];
    }
}


 exports.deleteImages = async (obj,name) => {
    const imagePromises = obj[name].map(async (image) => {
        let objImagePromise;
        if (image.imageId.imageName) {
            objImagePromise = this.deleteImage(image.imageId.imageName);
        }
        const deletedImage = Image.findOneAndDelete({_id:image.imageId._id})

        await Promise.all([deletedImage, objImagePromise]);
    });

    await Promise.all(imagePromises);
}