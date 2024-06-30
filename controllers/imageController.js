const asyncHandler = require('../middleware/tryCatch');
const Image = require('../models/imageModel');
const crypto = require('crypto');
const { storeImage, deleteImage, getImage } = require('../utils/Images');

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const uploadImage = asyncHandler ( async (req, res, next) => {
    const foundImage = await Image.findOne({_id:req.params.id})

    if(!foundImage)
    {
        res.status(404)
        throw new Error('Image instance not found');
    }

    if(req.file)
    {     
        if(foundImage.imageName)
            await deleteImage(foundImage.imageName)
        
        const imageName = generateFileName();
        await storeImage(req.file, imageName)

        foundImage.imageName = imageName
        await foundImage.save()
    }

    if(req.body.image === '')
    {
        if(foundImage.imageName)
            await deleteImage(foundImage.imageName)
        
        foundImage.imageName = ''
        await foundImage.save()
    }

    let imgUrl = '';
    if(foundImage.imageName)
    {
        imgUrl = await getImage(foundImage.imageName)
    }

    res.status(200).json({message:"Image updated successfully", image:imgUrl})
})


const uploadImages = asyncHandler ( async (req, res, next) => {
    const savedImages = await Promise.all(req.files.map(async (file) => {
        const imageName = generateFileName();
        const storeImagePromise = storeImage(file, imageName)
        const image = new Image({ imageName });
        const savePromise = image.save();
        await Promise.all([savePromise, storeImagePromise]);
        return image; 
    }));

    const imageIds = savedImages.map(image => image._id);

    res.json({ message: `images uploaded successfully`, imageIds });
})

const updateImages = asyncHandler ( async (req, res, next) => {
    let savedImages = [];
    if(req.files.length > 0)
    {
        savedImages = await Promise.all(req.files.map(async (file) => {
        const imageName = generateFileName();
        const storeImagePromise = storeImage(file, imageName)
        const image = new Image({ imageName });
            const savePromise = image.save();
            await Promise.all([savePromise, storeImagePromise]);
            return image; 
        }));
    }

    const originalImages =JSON.parse(req.body.originalImages)
    const imagesChanged =JSON.parse(req.body.imagesChanged)
    const imagesToDelete = originalImages.filter(oriImage =>
        !imagesChanged.some(changedImage => {
            if (changedImage && changedImage.imageId) {
                return changedImage.imageId._id === oriImage.imageId._id;
            }
            return false;
        })
    );
    
    const imagesToRetain = originalImages.filter(oriImage =>
        imagesChanged.some(changedImage => {
            if(changedImage?.imageId)
            return changedImage.imageId._id === oriImage.imageId._id
        else
        return false
        })
        ).map(img => {
            if(img.imageId) return img.imageId._id;
        });

    if(imagesToDelete.length > 0)
    {
        await Promise.all(imagesToDelete.map(async (img) => {
            const [deletedImage] = await Promise.all([
                Image.findOneAndDelete({ _id: img.imageId._id }),
                deleteImage(img.imageId.imageName)
            ]);
        }));
    }
    
    const imageIds = savedImages?.map(image => image._id);

    res.json({ message: `images uploaded successfully`,imageIds:[...imagesToRetain, ...imageIds] });

})



module.exports = {uploadImage, uploadImages, updateImages}