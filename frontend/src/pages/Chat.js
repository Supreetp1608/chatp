import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const Chat = ({ user, token, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverPin, setReceiverPin] = useState('');
  const [currentChat, setCurrentChat] = useState(null);
  const [socket, setSocket] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io(process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('authenticate', token);

    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
      loadConversations();
    });

    loadConversations();

    return () => newSocket.close();
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const response = await axios.get('/api/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (pin) => {
    try {
      const response = await axios.get(`/api/chat/messages/${pin}`, {
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
      setReceiverPin('');
      setShowNewChat(false);
    }
  };

  const handleConversationClick = (pin) => {
    loadMessages(pin);
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

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* WhatsApp-style Sidebar */}
      <div className="w-1/3 bg-white flex flex-col">
        {/* Header */}
        <div className="bg-gray-100 p-4 flex items-center justify-between border-r border-gray-300">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-medium text-gray-800">{user.username}</h2>
              <p className="text-xs text-gray-500">PIN: {user.pin}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"
              title="New Chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* New Chat Input */}
        {showNewChat && (
          <div className="p-4 bg-blue-50 border-b">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter PIN"
                value={receiverPin}
                onChange={(e) => setReceiverPin(e.target.value)}
                maxLength="3"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleStartChat}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Start
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-3 bg-gray-50 border-b">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search or start new chat"
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No chats yet</p>
              <p className="text-gray-400 text-xs mt-1">Start a conversation by entering a PIN</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.pin}
                onClick={() => handleConversationClick(conv.pin)}
                className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                  currentChat === conv.pin ? 'bg-gray-100' : ''
                }`}
              >
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {conv.pin}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-medium text-gray-900 truncate">PIN: {conv.pin}</h4>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatTime(conv.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage}
                    </p>
                    {conv.messageCount > 0 && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                        {conv.messageCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* WhatsApp-style Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-gray-100 p-4 flex items-center border-b border-gray-300">
              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold mr-3">
                {currentChat}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">PIN: {currentChat}</h3>
                <p className="text-sm text-gray-500">
                  {messages.length} message{messages.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Messages with WhatsApp background pattern */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-2"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5ddd5' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundColor: '#e5ddd5'
              }}
            >
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.senderId._id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm relative ${
                      message.senderId._id === user.id
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-800'
                    }`}
                    style={{
                      borderRadius: message.senderId._id === user.id 
                        ? '18px 18px 4px 18px' 
                        : '18px 18px 18px 4px'
                    }}
                  >
                    <p className="text-sm leading-relaxed">{message.message}</p>
                    <div className={`flex items-center justify-end mt-1 text-xs ${
                      message.senderId._id === user.id ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      <span className="mr-1">{formatTime(message.timestamp)}</span>
                      {message.senderId._id === user.id && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    {message.senderId._id !== user.id && (
                      <div className="text-xs text-gray-400 mt-1">
                        PIN: {message.senderId.pin}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* WhatsApp-style Message Input */}
            <div className="bg-gray-100 p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <button
                  type="button"
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#e5ddd5' }}>
            <div className="text-center">
              <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-gray-600 mb-2">ChatApp Web</h3>
              <p className="text-gray-500 max-w-md">
                Send and receive messages by connecting with PINs. 
                Keep your conversations private and secure.
              </p>
              <p className="text-gray-400 text-sm mt-4">
                Select a chat to start messaging or create a new conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;