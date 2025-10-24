const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');

const socketHandler = (io) => {
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    socket.on('authenticate', async (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (user) {
          connectedUsers.set(socket.id, user);
          socket.join(user._id.toString());
        }
      } catch (error) {
        socket.emit('auth_error', 'Invalid token');
      }
    });

    socket.on('send_message', async (data) => {
      try {
        const sender = connectedUsers.get(socket.id);
        if (!sender) return;

        const receiver = await User.findOne({ pin: data.receiverPin });
        if (!receiver) return;

        const message = new Message({
          senderId: sender._id,
          receiverId: receiver._id,
          message: data.message
        });

        await message.save();
        await message.populate('senderId', 'username pin');
        await message.populate('receiverId', 'username pin');

        io.to(sender._id.toString()).emit('new_message', message);
        io.to(receiver._id.toString()).emit('new_message', message);
      } catch (error) {
        socket.emit('message_error', 'Failed to send message');
      }
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
    });
  });
};

module.exports = socketHandler;