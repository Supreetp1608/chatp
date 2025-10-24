const Message = require('../models/Message');
const User = require('../models/User');

const getMessages = async (req, res) => {
  try {
    const { receiverPin } = req.params;
    const senderId = req.userId;

    const receiver = await User.findOne({ pin: receiverPin });
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    const messages = await Message.find({
      $or: [
        { senderId, receiverId: receiver._id },
        { senderId: receiver._id, receiverId: senderId }
      ]
    }).populate('senderId', 'username pin').populate('receiverId', 'username pin').sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', userId] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$message' },
          lastMessageTime: { $first: '$timestamp' },
          messageCount: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$senderId', userId] }, { $eq: ['$read', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          pin: '$user.pin',
          username: '$user.username',
          lastMessage: 1,
          lastMessageTime: 1,
          messageCount: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { receiverPin, message } = req.body;
    const senderId = req.userId;

    const receiver = await User.findOne({ pin: receiverPin });
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newMessage = new Message({
      senderId,
      receiverId: receiver._id,
      message
    });

    await newMessage.save();
    await newMessage.populate('senderId', 'username pin');
    await newMessage.populate('receiverId', 'username pin');

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMessages, sendMessage, getConversations };