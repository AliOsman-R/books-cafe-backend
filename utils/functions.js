const crypto = require('crypto');
exports.generateOrderNumber = () => {
    const bytes = crypto.randomBytes(4);
    const orderNumber = bytes.toString('hex');
    return orderNumber;
}

exports.getProductOrError = (product, cartItem) => {
    if (!product) {
        throw new Error(`Product with the name "${product.name || product.title}" is no longer available. Please remove from the cart to contiune`);
    }
    if (product.stock === 0) {
        throw new Error(`Product "${product.name || product.title}" is out of stock. please remove from the cart to contiune`);
    }
    if (cartItem.quantity > product.stock) {
        throw new Error(`Requested quantity for "${product.name || product.title}" exceeds stock available.`);
    }
    return product;
};