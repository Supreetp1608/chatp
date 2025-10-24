import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const Chat = ({ user, token, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverPin, setReceiverPin] = useState('');
  const [currentChat, setCurrentChat] = useState(null);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('authenticate', token);

    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => newSocket.close();
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (pin) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/chat/messages/${pin}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
      setCurrentChat(pin);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleStartChat = () => {
    if (receiverPin && receiverPin !== user.pin) {
      loadMessages(receiverPin);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat) return;

    try {
      socket.emit('send_message', {
        receiverPin: currentChat,
        message: newMessage
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-300">
        <div className="p-4 border-b border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">{user.username}</h2>
              <p className="text-gray-600">PIN: {user.pin}</p>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter PIN to chat"
              value={receiverPin}
              onChange={(e) => setReceiverPin(e.target.value)}
              maxLength="3"
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleStartChat}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Chat
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            <div className="bg-gray-50 p-4 border-b border-gray-300">
              <h3 className="font-semibold">Chat with PIN: {currentChat}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.senderId._id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId._id === user.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.senderId._id === user.id ? 'You' : `PIN: ${message.senderId.pin}`} • {' '}
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-300">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Enter a PIN to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;