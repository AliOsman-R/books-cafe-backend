const Image = require('../models/imageModel');
const { getImage } = require('./Images');
exports.getCafeOwnerData = async (cafes) => {

    await Promise.all(cafes.map(async (cafe) => {
        const foundUserImage  = await Image.findOne({_id:cafe.userId.imageId})
        let cafeImagePromise, userImagePromise
        if(cafe.imageId.imageName)
        {
            cafeImagePromise = getImage(cafe.imageId.imageName)
        }
        if(foundUserImage.imageName)
        {
            userImagePromise = getImage(foundUserImage.imageName)
        }
        const [cafeImage, userImage] = await Promise.all([cafeImagePromise, userImagePromise]);    

        cafe['image'] = cafeImage || '';
        cafe['ownerImage'] = userImage || '';
        cafe['ownerName'] = cafe.userId.name
    }))

    return cafes
}