const Chat = require('../models/chat.model');
const User = require('../../models/user.model');
const Message = require('../models/message.model');
const errorHandler = require('../../utils/error');

/**
 * POST /api/v1/chat/init
 * Body: { astrologerId, userDetails: { name, gender, date, time, place } }
 */
exports.initChat = async (req, res, next) => {
  try {
    const { astrologerId, userDetails } = req.body;
    const userId = req.user.id;

    // Check if the astrologer (which is also stored in user collection) exists
    const astrologerUser = await User.findById(astrologerId);
    if (!astrologerUser) {
      return next(errorHandler(404, 'Astrologer user not found'));
    }

    // 1) Find existing Chat or create a new one
    let chat = await Chat.findOne({ userId, astrologerId });
    if (!chat) {
      chat = new Chat({
        userId,
        astrologerId,
        messages: [],
      });
      await chat.save();
    }

    // 2) Insert system message with user details
    const astrologerName = astrologerUser.name;
    const { name, gender, date, time, place } = userDetails;
    const systemMessage = {
      sender: userId,
      content: `Hi ${astrologerName},\nBelow are my details:\nName: ${name}\nGender: ${gender}\nDOB: ${date}\nTOB: ${time}\nPOB: ${place}`,
      type: 'system',
    };

    chat.messages.push(systemMessage);
    await chat.save();

    return res.status(200).json({
      success: true,
      chatId: chat._id,
      message: 'Chat initialized with user details.'
    });
  } catch (error) {
    next(error);
  }
};


exports.getUserChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ $or: [{ userId: req.user.id }, { astrologerId: req.user.id }] })
      .populate('userId', 'name avatar')
      .populate('astrologerId', 'name avatar')
      .lean();

    const enhancedChats = await Promise.all(chats.map(async (chat) => {
      const unreadCount = await Message.countDocuments({
        chat: chat._id,
        sender: { $ne: req.user.id },
        createdAt: { $gt: req.user.role === 'user' ? chat.userLastRead : chat.astrologerLastRead }
      });

      return { ...chat, unreadCount };
    }));

    res.status(200).json(enhancedChats);
  } catch (error) {
    next(error);
  }
};

exports.getChatMessages = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('userId', 'name avatar')
      .populate('astrologerId', 'name avatar')
      .populate({
        path: 'messages.sender',
        select: 'name avatar'
      })
      .lean();

    if (!chat) {
      return next(errorHandler(404, 'Chat not found'));
    }

    // Check access
    if (![chat.userId._id.toString(), chat.astrologerId._id.toString()].includes(req.user.id)) {
      return next(errorHandler(403, 'Access denied'));
    }

    // Create message map for replyTo resolution
    const messageMap = new Map();
    chat.messages.forEach(msg => {
      messageMap.set(msg._id.toString(), {
        ...msg,
        sender: msg.sender ? {
          _id: msg.sender._id,
          name: msg.sender.name,
          avatar: msg.sender.avatar
        } : null
      });
    });

    // Process messages with replyTo resolution
    const processedMessages = chat.messages.map(msg => {
      let replyTo = null;
      
      if (msg.replyTo) {
        const originalMsg = messageMap.get(msg.replyTo.toString());
        if (originalMsg) {
          replyTo = {
            _id: originalMsg._id,
            content: originalMsg.content,
            sender: originalMsg.sender,
            createdAt: originalMsg.createdAt,
            type: originalMsg.type
          };
        }
      }

      return {
        _id: msg._id,
        sender: msg.sender ? {
          _id: msg.sender._id,
          name: msg.sender.name,
          avatar: msg.sender.avatar
        } : { _id: 'deleted-user', name: 'Deleted User', avatar: '/default-avatar.png' },
        content: msg.content,
        createdAt: msg.createdAt,
        type: msg.type,
        reactions: msg.reactions || {},
        replyTo
      };
    });

    res.status(200).json({
      success: true,
      messages: processedMessages
    });
  } catch (error) {
    next(error);
  }
};

exports.DeleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.chatId);
    if (!chat) return next(errorHandler(404, 'Chat not found'));

    await Message.deleteMany({ _id: { $in: chat.messages } });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.markChatAsRead = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const chat = await Chat.findById(chatId);
    if (!chat) return next(errorHandler(404, 'Chat not found'));

    if (userRole === 'user') chat.userLastRead = new Date();
    else if (userRole === 'astrologer') chat.astrologerLastRead = new Date();
    else return next(errorHandler(403, 'Invalid role'));

    await chat.save();
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};