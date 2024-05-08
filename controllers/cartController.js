const asyncHandler = require('../middleware/tryCatch');
const mongoose = require('mongoose');
const Image = require('../models/imageModel');
const User = require('../models/userModel');
const Menu = require('../models/menuModel');
const Book = require('../models/bookModel');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const { fetchImages} = require('../utils/Images');
const { generateOrderNumber } = require('../utils/functions');
const { sendEmail } = require('../utils/email');
const { getProductOrError } = require('../utils/functions');


const addToCart = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const {userId, cafeId, type, quantity, productName} = req.body

    if(!userId || !cafeId || !type || !quantity)
    {
        res.status(400)
        throw new Error("Please provide all necessary data")
    }

    const cartItem = Cart.create({
        productId:id,
        userId,
        cafeId,
        productName,
        type,
        quantity
    })

    res.status(200).json({message:"added to the cart successfully", cartItem });
})


const updateCartItem = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const {quantity} = req.body
    if (!quantity) {
        res.status(400)
        throw new Error('Quantity not provided')
    }
    const cartItem = await Cart.findOneAndUpdate({productId:id}, { $set: { quantity } }, { new: true })

    res.status(200).json({ message:'Product has been updated successfully' });
})


const deleteCartItem = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const cartItem = await Cart.findOneAndDelete({productId:id})

    if(!cartItem)
    {
        res.status(404)
        throw new Error("Product is not available in database")
    }

    res.status(200).json({ message:'Product has been deleted successfully' });
})


const clearCart = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    await Cart.deleteMany({userId:id})

    res.status(200).json({ message:'Products has been deleted successfully' });
})


const placeOrder = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const {cartItems, user,...rest} = req.body
    const products = []

    await Promise.all(cartItems.map(async (cartItem) => {
        const product = await (cartItem.name ? Menu.findOne({_id: cartItem._id}) : Book.findOne({_id: cartItem._id}));
        res.status(404)
        return getProductOrError(product, cartItem);
    }))


    await Promise.all(cartItems.map(async (cartItem) => {
        const product = await (cartItem.name ? Menu.findOne({_id: cartItem._id}) : Book.findOne({_id: cartItem._id}));
        const item = {
            productId:cartItem._id,
            quantity:cartItem.quantity,
            price:cartItem.price,
            item:cartItem
        }
        product.stock -= parseInt(cartItem.quantity)
        product.pendingStock += parseInt(cartItem.quantity)
        item['images'] = product.images
        product.name? item['type'] = 'menu' : item['type'] = 'books'
        products.push(item)
        return product.save()
    }))   

    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    const order = await Order.create({
        ...rest,
        orderId:generateOrderNumber(),
        products,
        status: 'pending',
        progress: {
            activity:'orderPlaced',
            time:formattedTime,
            date:formattedDate
        },
        userId:id
    })

    
    if(!order)
    {
        res.status(400)
        throw new Error(`Something went wrong please try again later`)
    }
    // const productsHtml = cartItems.map(product => `
    //     <div>
    //         <h3>${product.name || product.title} - ${product.price} RM</h3>
    //         <p>Quantity: ${product.quantity}</p>
    //     </div>
    // `).join('');

    // const htmlStr = `
    //         <h2>Your payment has been confirmed ${order.totalPrice} RM</h2>
    //         <h3>Order Id: ${order.orderId}</h3>
    //         <p>The order is pending now, once the cafe confirm it the status will be changed</p>
    //         ${productsHtml}
    //     `
    // const emailPromise = sendEmail(user.email, 'CafeX - Payment confirmation',{htmlStr,url:'',btn:"Payment confirmation"})
    
    const deletePromise = await Cart.deleteMany({userId:id})
    // await Promise.all([emailPromise, deletePromise])

    res.status(200).json({message:"Payment is successful"})
})


const getUserCart = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const cart = await Cart.find({userId:id})
    const cartPromise = cart.map(async (cartItem) => {
        if(cartItem.type === 'menu')
        {
            const menu =await Menu.findOne({_id:cartItem.productId}).populate({path: 'images.imageId cafeId', select:'imageName orderMethods deliveryFee deliveryEst'}).exec();
            if(menu)
            {
               return fetchImages(menu)
            }
        }
        else
        {
            const book = await Book.findOne({_id:cartItem.productId}).populate({path: 'images.imageId cafeId', select:'imageName orderMethods deliveryFee deliveryEst'}).exec();
            if(book)
            {
              return fetchImages(book)
            }
        }
    })

    let cartItems = await Promise.all(cartPromise)


    cartItems = cartItems.filter(item => item !== null &&  item?.stock > 0)

    // const notAvailable = cart.filter(item => !cartItems.some(cartItem => cartItem.name === item.productName));
    
    const updatedCart = cartItems.map(cartItem => {
        const match = cart.find(item => {
            return item.productId.equals(cartItem._id)
        });
    
        if (match) {
            return {...cartItem._doc,  quantity: match.quantity };
        }
    
        return {...cartItem._doc,  quantity: 1 };
    });    


    res.status(200).json({ cartItems:updatedCart });
})


module.exports = {
    addToCart,
    updateCartItem,
    deleteCartItem,
    getUserCart,
    clearCart,
    placeOrder
}