const asyncHandler = require('../middleware/tryCatch');
const mongoose = require('mongoose');
const Image = require('../models/imageModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const Order = require('../models/orderModel');
const Cafe = require('../models/cafeModel');
const Menu = require('../models/menuModel');
const Book = require('../models/bookModel');
const Event = require('../models/eventModel');
// const crypto = require('crypto');
const { getImage, deleteImage} = require('../utils/Images');
const { months } = require('../utils/constants');

const getCafeDashboard = asyncHandler(async (req, res, next) => {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const orderPromise = Order.find({cafeId:id}).populate({path:'userId', select:'name'}).exec();
    const menuPromise = Menu.find({cafeId:id})
    const booksPromise = Book.find({cafeId:id})
    const eventsPromise = Event.find({cafeId:id})
    const cafePromise = Cafe.findOne({_id:id})
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);
    const startOfMonth = new Date(currentYear, new Date().getMonth(), 1);

    const [orders, menu, books, cafe, events] = await Promise.all([orderPromise, menuPromise, booksPromise, cafePromise,eventsPromise])
    const ordersReceived = orders.length
    const ordersCompeleted= orders.filter((order) => order.status === 'completed').length
    const inventory = menu.length + books.length
    const totalBooks = books.length
    const totalMenuItems = menu.length
    const totalSales = cafe.sales;

    const totalSalesThisMonthResultPromise = Order.aggregate([
        { $match: {cafeId:id, status: 'completed', createdAt: { $gte: startOfMonth } } },
        { $unwind: '$products' },
        { $group: { _id: null, totalQuantity: { $sum: '$products.quantity' } } }
      ]);

    const totalRevenueResultPromise = Order.aggregate([
        { $match: { cafeId: id, status: 'completed' } },
        { $group: { _id: null, revenue: { $sum: { $subtract: ['$totalPrice', '$sstAmount'] } } } }
      ]);

    const totalRevenueThisMonthResultPromise = Order.aggregate([
    { $match: { cafeId: id, status: 'completed', createdAt: { $gte: startOfMonth } } },
    { $group: { _id: null, revenue: { $sum: { $subtract: ['$totalPrice', '$sstAmount'] } } } }
    ]);

    const monthlyRevenuePromise = Order.aggregate([
        { $match: { cafeId: id, status: 'completed', createdAt: { $gte: startOfYear, $lt: endOfYear } } },
        { $group: {_id: { $month: "$createdAt" }, revenue: { $sum: { $subtract: ['$totalPrice', '$sstAmount'] } } } },
        {
            $addFields: {
              revenue: { $round: ["$revenue", 2] }
            }
        },
        { $sort: { _id: 1 } }
        ]);
        
    const top3ItemsPromise = Order.aggregate([
        { $match: { cafeId: id, status: 'completed' } },
        { $unwind: '$products' },
        { $group: {
            _id: {
            $ifNull: ['$products.item.title', '$products.item.name']  
            },
            value: { $sum: '$products.quantity' },  // Summing up all quantities sold for this item
            label: { $first: { $ifNull: ['$products.item.title', '$products.item.name'] } }  
        }},
        { $sort: { value: -1 } },  
        { $limit: 3 }  
        ]);

        const topUsersPromise = Order.aggregate([
            { $match: { cafeId: id } },
            { $group: { _id: "$userId", orderCount: { $sum: 1 } } },
            { $sort: { orderCount: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
                }
            },
            { $unwind: "$user" },
            { $project: { _id: 1, orderCount: 1, 'user.name': 1 } }
          ]);

    const [totalSalesThisMonthResult, totalRevenueResult, totalRevenueThisMonthResult, monthlyRevenue, top3Items,topUsers] = await Promise.all(
        [totalSalesThisMonthResultPromise, totalRevenueResultPromise, totalRevenueThisMonthResultPromise, 
            monthlyRevenuePromise, top3ItemsPromise, topUsersPromise])
        
    const totalSalesThisMonth = totalSalesThisMonthResult[0]?.totalQuantity || 0;
    const totalRevenue = totalRevenueResult[0]?.revenue.toFixed(2) || 0;
    const totalRevenueThisMonth = totalRevenueThisMonthResult[0]?.revenue.toFixed(2) || 0;

    const monthlyRevenues = []
    for(i = 1; i < 13; i++)
    {
        const foundMonth = monthlyRevenue.find(month => month._id === i)
        if(foundMonth)
            monthlyRevenues.push({...foundMonth, month:months[i-1]})
        else
            monthlyRevenues.push({_id:i, revenue:0, month:months[i-1]})
    }

    const items = [...menu, ...books];

    items.sort((a, b) => b.createdAt - a.createdAt);

    const dashbaord = {
        ordersReceived,
        ordersCompeleted,
        totalSales,
        totalSalesThisMonth,
        inventory,
        totalBooks,
        totalMenuItems,
        totalRevenue,
        totalRevenueThisMonth,
        top3Items,
        monthlyRevenues,
        cafe,
        items,
        topUsers,
        events
    }

    res.status(200).json({message:'ok', dashbaord})

})




module.exports = {
    getCafeDashboard
}