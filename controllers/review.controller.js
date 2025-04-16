const Review = require('../models/review.model');
const Astrologer = require('../models/astrologer.model');
const errorHandler = require('../utils/error');

// Create a review
module.exports.createReview = async (req, res, next) => {
  try {
    const { astrologerId, rating, comment } = req.body;

    // Verify astrologer exists
    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return next(errorHandler(404, 'Astrologer not found'));
    }

    // Check if user has already reviewed
    const existingReview = await Review.findOne({
      userId: req.user.id,
      astrologerId
    });

    if (existingReview) {
      return next(errorHandler(400, 'You have already reviewed this astrologer'));
    }

    const review = new Review({
      userId: req.user.id,
      astrologerId,
      rating,
      comment
    });

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name avatar')
      .populate('replies.userId', 'name avatar role');

    res.status(201).json(populatedReview);
  } catch (error) {
    next(error);
  }
};

// Edit review
module.exports.editReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { comment, rating } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return next(errorHandler(404, 'Review not found'));
    }

    // Verify ownership
    if (review.userId.toString() !== req.user.id) {
      return next(errorHandler(403, 'You can only edit your own reviews'));
    }

    // Store edit history
    if (review.comment !== comment) {
      review.editHistory.push({
        comment: review.comment,
        editedAt: Date.now()
      });
      review.edited = true;
      review.comment = comment;
    }

    if (rating) {
      review.rating = rating;
    }

    await review.save();

    const populatedReview = await Review.findById(reviewId)
      .populate('userId', 'name avatar')
      .populate('replies.userId', 'name avatar role');

    res.status(200).json(populatedReview);
  } catch (error) {
    next(error);
  }
};

// Add reply to review
module.exports.addReply = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return next(errorHandler(404, 'Review not found'));
    }

    // Check if user is either the astrologer or the review owner
    const astrologer = await Astrologer.findById(review.astrologerId);
    const isAstrologer = astrologer.userId.toString() === req.user.id;
    const isReviewOwner = review.userId.toString() === req.user.id;

    if (!isAstrologer && !isReviewOwner) {
      return next(errorHandler(403, 'Only the astrologer or review owner can reply'));
    }

    const reply = {
      userId: req.user.id,
      comment
    };

    review.replies.push(reply);
    await review.save();

    const populatedReview = await Review.findById(reviewId)
      .populate('userId', 'name avatar')
      .populate('replies.userId', 'name avatar role');

    res.status(200).json(populatedReview);
  } catch (error) {
    next(error);
  }
};

// Edit reply
module.exports.editReply = async (req, res, next) => {
  try {
    const { reviewId, replyId } = req.params;
    const { comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return next(errorHandler(404, 'Review not found'));
    }

    const reply = review.replies.id(replyId);
    if (!reply) {
      return next(errorHandler(404, 'Reply not found'));
    }

    // Verify ownership
    if (reply.userId.toString() !== req.user.id) {
      return next(errorHandler(403, 'You can only edit your own replies'));
    }

    // Store edit history
    reply.editHistory.push({
      comment: reply.comment,
      editedAt: Date.now()
    });
    reply.edited = true;
    reply.comment = comment;

    await review.save();

    const populatedReview = await Review.findById(reviewId)
      .populate('userId', 'name avatar')
      .populate('replies.userId', 'name avatar role');

    res.status(200).json(populatedReview);
  } catch (error) {
    next(error);
  }
};

// Mark review as helpful
module.exports.markReviewHelpful = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return next(errorHandler(404, 'Review not found'));
    }

    const helpfulIndex = review.helpful.indexOf(req.user.id);
    if (helpfulIndex === -1) {
      review.helpful.push(req.user.id);
    } else {
      review.helpful.splice(helpfulIndex, 1);
    }

    await review.save();

    res.status(200).json({ 
      helpful: review.helpful.length,
      isHelpful: helpfulIndex === -1
    });
  } catch (error) {
    next(error);
  }
};

// Get reviews for astrologer with filters
module.exports.getAstrologerReviews = async (req, res, next) => {
  try {
    const { astrologerId } = req.params;
    const { 
      sort = 'recent', // 'recent' or 'helpful'
      rating,
      page = 1,
      limit = 10
    } = req.query;

    const query = { astrologerId };
    if (rating) {
      query.rating = parseInt(rating);
    }

    const sortOptions = {
      recent: { createdAt: -1 },
      helpful: { helpful: -1, createdAt: -1 }
    };

    const reviews = await Review.find(query)
      .sort(sortOptions[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name avatar')
      .populate('replies.userId', 'name avatar role')
      .populate('helpful', 'name');

    const total = await Review.countDocuments(query);

    res.status(200).json({
      reviews,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        perPage: limit
      }
    });
  } catch (error) {
    next(error);
  }
};
