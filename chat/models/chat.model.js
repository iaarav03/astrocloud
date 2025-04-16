const mongoose = require("mongoose");
const Message = require('./message.model'); // Import the Message model

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    astrologerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    messages: [{
      type: Message.schema,
      required: true
    }],
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active'
    },
    userLastRead: Date,
    astrologerLastRead: Date,
  },
  { timestamps: true }
);

chatSchema.index({ userId: 1, astrologerId: 1 }, { unique: true });

module.exports = mongoose.model('Chat', chatSchema);