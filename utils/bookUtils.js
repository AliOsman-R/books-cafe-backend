const { getImage } = require("./Images");


exports.getBooksImages = async (book) => {
    const imagePromises = book.images.map(async (image) => {
        if (image.imageId.imageName) {
            const bookImage = await getImage(image.imageId.imageName);
            image.url = bookImage;
        }
    });

    const bookPlaceImagePromises = book.bookPlaceImages.map(async (image) => {
        if (image.imageId.imageName) {
            const bookImage = await getImage(image.imageId.imageName);
            image.url = bookImage;
        }
    });

    await Promise.all([imagePromises, bookPlaceImagePromises]);

} 