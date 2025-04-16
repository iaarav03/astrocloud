const express = require('express');
const {
  getUserChats,
  getChatMessages,
  initChat,  
  DeleteChat,
  markChatAsRead,
} = require('../controllers/chat.controller');
const verifyToken = require('../../utils/verifyUser');

const router = express.Router();

router.get('/list', verifyToken, getUserChats);
router.get('/:chatId', verifyToken, getChatMessages);
router.delete('/:chatId', verifyToken, DeleteChat);
router.post('/init', verifyToken, initChat);
router.put('/:chatId/read', verifyToken, markChatAsRead);

module.exports = router;
