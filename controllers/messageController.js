const Message = require('../models/messageModel')
const asyncHandler = require('../middleware/tryCatch')
const Conversation = require('../models/conversationModel')
const User = require('../models/userModel')
const { getReceiverSocketId, io } = require('../sockets/socket')

const sendMessage = asyncHandler(async (req, res, next) => {
    const receiverId = req.params.id
    const {message} = req.body
    const senderId = req.user._id

    const conversationPromise = Conversation.findOne({participants:{ $all: [senderId, receiverId] }})
    
    const senderUserPromsie = User.findOne({_id:senderId})
    const receiverUserPromise = User.findOne({_id:receiverId})

    let [senderUser, receiverUser, conversation] = await Promise.all([senderUserPromsie, receiverUserPromise, conversationPromise])

    if(!conversation)
    {
        conversation = await Conversation.create({
            participants:[senderId, receiverId],
        })

        senderUser.chatUsers.push({userId: receiverUser._id})
        receiverUser.chatUsers.push({userId: senderUser._id})
    }

    const newMessage = new Message({
        senderId,
        receiverId,
        message,
    });

     senderUser.chatUsers.map(chatuser => {
        if (chatuser.userId.equals(receiverUser._id)){
            chatuser.lastMessage = message
            chatuser.date = new Date()
        }
    })

    receiverUser.chatUsers.map(chatuser => {
        if (chatuser.userId.equals(senderUser._id)){
            chatuser.lastMessage = message
            chatuser.date = new Date()
        }
    })

    if (newMessage) {
        conversation.messages.push(newMessage._id);
    }

    await Promise.all([conversation.save(), newMessage.save(), senderUser.save(), receiverUser.save()]);

    const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", {newMessage, senderId});
		}

    res.status(201).json({newMessage, message:'Send message successfully'})
})

const getMessages = asyncHandler( async (req, res, next) => {
    const receiverId = req.params.id
    const senderId = req.user._id

    const conversation = await Conversation.findOne({participants:{ $all: [senderId, receiverId] }}
    ).populate({path:'messages'}).exec();

    if (!conversation) return res.status(200).json({messages:[]});
    
    const messages = conversation.messages

    res.status(200).json({messages})

})



module.exports = {sendMessage, getMessages}