const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true },
    edited: { type: Boolean, default: false },
    editHistory: [{
      comment: String,
      editedAt: Date
    }]
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    astrologerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    edited: { type: Boolean, default: false },
    editHistory: [{
      comment: String,
      editedAt: Date
    }],
    replies: [replySchema],
    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
