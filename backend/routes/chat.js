const express = require('express');
const { getMessages, sendMessage } = require('../controllers/chatController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/messages/:receiverPin', auth, getMessages);
router.post('/send', auth, sendMessage);

module.exports = router;