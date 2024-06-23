const asyncHandler = require('../middleware/tryCatch');
const Menu = require('../models/menuModel');
const Book = require('../models/bookModel');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const { fetchImages} = require('../utils/Images');
const { generateOrderNumber } = require('../utils/orderUtils');
const { sendEmail, generatePaymentEmail } = require('../utils/email');
const { getProductOrError } = require('../utils/orderUtils');


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
    await Cart.findOneAndUpdate({productId:id}, { $set: { quantity } }, { new: true })

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

    const productPromises = cartItems.map(cartItem => (
        cartItem.name ? Menu.findOne({ _id: cartItem._id }) : Book.findOne({ _id: cartItem._id })
    ));
    const productResults = await Promise.all(productPromises);

    for (let i = 0; i < cartItems.length; i++) {
        const cartItem = cartItems[i];
        const product = productResults[i];
        res.status(404)
        getProductOrError(product, cartItem);
    }

    await Promise.all(cartItems.map(async (cartItem, index) => {
        const product = productResults[index];
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
        userId:id,
        customerDetails:{
            name:user.name,
            email:user.email
        }
    })

    
    if(!order)
    {
        res.status(400)
        throw new Error(`Something went wrong please try again later`)
    }

    const html = generatePaymentEmail(order, user)

    const emailPromise = sendEmail(user.email, 'CafeX - Payment Confirmation', html)
    
    const deletePromise = Cart.deleteMany({userId:id})
    
    await Promise.all([emailPromise, deletePromise])

    res.status(200).json({message:"Payment is successful"})
})

const getUserCart = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const cart = await Cart.find({userId:id})

    const cartPromise = cart.map(async (cartItem) => {
        if(cartItem.type === 'menu')
        {
            const menu =await Menu.findOne({_id:cartItem.productId})
            .populate({path: 'images.imageId cafeId', select:'imageName orderMethods deliveryFee deliveryEst'}).exec();

            if(menu)
            {
               return fetchImages(menu)
            }
        }
        else
        {
            const book = await Book.findOne({_id:cartItem.productId})
            .populate({path: 'images.imageId cafeId', select:'imageName orderMethods deliveryFee deliveryEst'}).exec();

            if(book)
            {
              return fetchImages(book)
            }
        }
    })


    let cartItems = await Promise.all(cartPromise)


    cartItems = cartItems.filter(item => item !== null)
    
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