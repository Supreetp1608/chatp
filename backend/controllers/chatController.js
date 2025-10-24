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

module.exports = { getMessages, sendMessage };