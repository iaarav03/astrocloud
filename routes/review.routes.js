const express = require('express');
const { 
  createReview,
  editReview,
  addReply,
  editReply,
  markReviewHelpful,
  getAstrologerReviews
} = require('../controllers/review.controller');
const { auth } = require('../middlewares/auth');
const verifyToken = require('../utils/verifyUser');

const router = express.Router();

// Public routes
router.get('/astrologer/:astrologerId', getAstrologerReviews);

// Protected routes
router.post('/create', verifyToken, createReview);
router.patch('/:reviewId/edit', verifyToken, editReview); 
router.post('/:reviewId/reply', verifyToken, addReply);
router.patch('/:reviewId/reply/:replyId/edit', verifyToken, editReply);
router.patch('/:reviewId/helpful', verifyToken, markReviewHelpful);

module.exports = router;