const asyncHandler = require('../middleware/tryCatch');
const mongoose = require('mongoose');
const Image = require('../models/imageModel');
const User = require('../models/userModel');
const Menu = require('../models/menuModel');
const Book = require('../models/bookModel');
const Order = require('../models/orderModel');
const Cafe = require('../models/cafeModel');
const { deleteImages, fetchImages} = require('../utils/Images');
const { sendEmail } = require('../utils/email');


const getUserOrders = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const orders = await Order.find({userId:id})

    // await fetchImages(orders)

    res.status(200).json({ orders });
})


const getCafeOrders = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const orders = await Order.find({cafeId:id})

    // await fetchImages(orders)

    res.status(200).json({ orders });
})


const getOrder = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const order = await Order.findOne({_id:id}).populate({path:'userId', select:'name email'}).exec()

    const newOrder = await Promise.all(order.products.map(async (orderItem) => {
        const product = await (orderItem.type === 'menu' ? Menu.findOne({_id: orderItem.productId}).populate({path: 'images.imageId', select:'imageName'}).exec()
         : Book.findOne({_id: orderItem.productId}).populate({path: 'images.imageId', select:'imageName'}).exec())

         if(product)
            return fetchImages(product)
    })) 

    let products = []
    order.products.map((orderItem) => {
        const foundOrder = newOrder.find((item) => item._id.equals(orderItem.productId) )
        products.push({...orderItem._doc, item:foundOrder?foundOrder:orderItem.item})
    })

    res.status(200).json({ order:{...order._doc, products} });
})


const updateOrderStatus = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const {status} = req.body
    const order = await Order.findOne({_id:id})

    if(!order)
    {
        res.status(404)
        throw new Error(`Order with id "${id}" not found`)
    }

    if(status === 'cancelled')
    {
        await Promise.all(order.products.map(async (order) => {
            const product = await (order.type === 'menu' ? Menu.findOne({_id: order.productId}) : Book.findOne({_id: order.productId}));
            if(product)
            {
                product.stock += parseInt(order.quantity)
                product.pendingStock -= parseInt(order.quantity)
                return product.save()
            }
        })) 
        
        order.status = status
        await order.save()
    }

    if(status === 'confirmed')
    {
        await Promise.all(order.products.map(async (order) => {
            const product = await (order.type === 'menu' ? Menu.findOne({_id: order.productId}) : Book.findOne({_id: order.productId}));
            if(product)
            {
                product.pendingStock -= parseInt(order.quantity)
                return product.save()
            }
        })) 

    //     const productsHtml = cartItems.map(product => `
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
    //     const emailPromise = sendEmail(user.email, 'CafeX - Payment confirmation',{htmlStr,url:'',btn:"Payment confirmation"})
    
    }

    order.status = status
    await order.save()
    
    res.status(200).json({ order });
})


const updateProgressStatus =  asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const progressData = req.body
    console.log(progressData)
    const order = await Order.findOne({_id:id})

    if(!order)
    {
        res.status(404)
        throw new Error(`Order with id "${id}" not found`)
    }

    order.progress.push(progressData)
    if(progressData.activity === 'delivered')
    {
        order.status = 'completed'
    }

    await order.save()

    res.status(200).json({progressData, order})

})


const deleteOrder = asyncHandler(async (req, res, next) => {

})


module.exports = {
    getUserOrders,
    updateOrderStatus,
    deleteOrder,
    getCafeOrders,
    getOrder,
    updateProgressStatus
}