# MERN Chat Application

A real-time chat application built with MongoDB, Express.js, React, and Node.js featuring user authentication with unique PINs and Socket.IO for instant messaging.

## Features

- User registration with username, password, and unique 3-digit PIN
- JWT-based authentication
- Real-time messaging with Socket.IO
- PIN-based user connection (like phone numbers)
- Message history stored in MongoDB
- Clean UI with Tailwind CSS

## Tech Stack

- **Frontend**: React, Tailwind CSS, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt

## Project Structure

```
chat-app/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── chatController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── chat.js
│   ├── socket/
│   │   └── socketHandler.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   │   ├── Login.js
    │   │   └── Chat.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    └── postcss.config.js
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

4. Start the backend server:
```bash
npm run server
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## MongoDB Configuration

1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Get your connection string
4. Replace `your_mongodb_connection_string_here` in the `.env` file with your actual connection string

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chatapp?retryWrites=true&w=majority
```

## Usage

1. **Register**: Create an account with username, password, and a unique 3-digit PIN
2. **Login**: Use your username and password to log in
3. **Start Chat**: Enter another user's PIN to start or continue a conversation
4. **Real-time Messaging**: Messages appear instantly for both sender and receiver
5. **Message History**: All messages are stored and retrievable from MongoDB

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Chat
- `GET /api/chat/messages/:receiverPin` - Get chat history
- `POST /api/chat/send` - Send message

## Socket.IO Events

- `authenticate` - Authenticate user with JWT token
- `send_message` - Send real-time message
- `new_message` - Receive real-time message

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  passwordHash: String,
  pin: String (unique, 3 digits),
  createdAt: Date,
  updatedAt: Date
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  senderId: ObjectId (ref: User),
  receiverId: ObjectId (ref: User),
  message: String,
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation
- CORS configuration

## Development

To run both frontend and backend simultaneously, you can use two terminal windows:

Terminal 1 (Backend):
```bash
cd backend
npm run server
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.