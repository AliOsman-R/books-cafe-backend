const asyncHandler = require('../middleware/tryCatch');
const Menu = require('../models/menuModel');
const Book = require('../models/bookModel');
const Order = require('../models/orderModel');
const Cafe = require('../models/cafeModel');
const { fetchImages} = require('../utils/Images');
const { sendEmail, generateOrderDeliveredEmail } = require('../utils/email');


const getUserOrders = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const orders = await Order.find({userId:id})

    res.status(200).json({ orders });
})

const getCafeOrders = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const orders = await Order.find({cafeId:id})

    res.status(200).json({ orders });
})

const getOrder = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const order = await Order.findOne({_id:id})
    .populate({path:'userId cafeId', select:'name email userId'}).exec()

    const newOrder = await Promise.all(order.products.map(async (orderItem) => {
        const product = await (orderItem.type === 'menu' ? 
         Menu.findOne({_id: orderItem.productId}).populate({path: 'images.imageId', select:'imageName'}).exec()
         : Book.findOne({_id: orderItem.productId}).populate({path: 'images.imageId', select:'imageName'}).exec())

         if(product)
            return fetchImages(product)
    })) 

    let products = []
    order.products.map((orderItem) => {
        const foundOrder = newOrder.find((item) => item?._id.equals(orderItem.productId) )
        products.push({...orderItem._doc, item:foundOrder?foundOrder:orderItem.item})
    })

    res.status(200).json({ order:{...order._doc, products} });
})

const updateOrderStatus = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const {status,cafeId} = req.body
    const orderPromise =  Order.findOne({_id:id})
    const cafePromise =  Cafe.findOne({_id:cafeId})

    const [order, cafe] = await Promise.all([orderPromise, cafePromise])

    if(!order)
    {
        res.status(404)
        throw new Error(`Order with id "${id}" not found`)
    }

    if(status === 'cancelled')
    {
        await Promise.all(order.products.map(async (order) => {
            const product = await (order.type === 'menu' ?
             Menu.findOne({_id: order.productId}) : Book.findOne({_id: order.productId}));
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
        let totalSales = 0
         await Promise.all(order.products.map(async (order) => {
            const product = await (order.type === 'menu' ? Menu.findOne({_id: order.productId}) : Book.findOne({_id: order.productId}));
            if(product)
            {
                product.pendingStock -= parseInt(order.quantity)
                product.sold += parseInt(order.quantity)
                totalSales += parseInt(order.quantity)
                return product.save()
            }
        }))
        cafe.sales += parseInt(totalSales)
        await cafe.save()
    }

    order.status = status
    await order.save()
    
    res.status(200).json({ order });
})

const updateProgressStatus =  asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const progressData = req.body
    const order = await Order.findOne({_id:id}).populate({path:'userId' , select:'email name'})

    if(!order)
    {
        res.status(404)
        throw new Error(`Order with id "${id}" not found`)
    }

    order.progress.push(progressData)

    if(progressData.activity === 'delivered')
    {
        order.status = 'completed'
        
        const html = generateOrderDeliveredEmail(order, order.userId)

       await sendEmail(order.userId.email, 'CafeX - Order has been delivered', html)
    }

    await order.save()

    res.status(200).json({progressData, order})
})


module.exports = {
    getUserOrders,
    updateOrderStatus,
    getCafeOrders,
    getOrder,
    updateProgressStatus
}