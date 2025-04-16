const Astrologer = require('../models/astrologer.model');
const Specialization = require('../models/specialization.model');
const errorHandler = require('../utils/error');
const Review = require('../models/review.model');
const mongoose = require('mongoose');

/**
 * GET /api/v1/astrologers/filter-options
 */
exports.getFilterOptions = async (req, res, next) => {
  try {
    const languages = await Astrologer.distinct('languages');
    const specializations = await Specialization.find().select('name').lean();

    const [minCostDoc] = await Astrologer.find().sort({ costPerMinute: 1 }).limit(1).select('costPerMinute');
    const [maxCostDoc] = await Astrologer.find().sort({ costPerMinute: -1 }).limit(1).select('costPerMinute');
    const minCost = minCostDoc?.costPerMinute || 0;
    const maxCost = maxCostDoc?.costPerMinute || 500;

    const [minExpDoc] = await Astrologer.find().sort({ experience: 1 }).limit(1).select('experience');
    const [maxExpDoc] = await Astrologer.find().sort({ experience: -1 }).limit(1).select('experience');
    const minExperience = minExpDoc?.experience || 0;
    const maxExperience = maxExpDoc?.experience || 40;

    return res.status(200).json({
      success: true,
      data: {
        languages, 
        specializations, 
        minCost,
        maxCost,
        minExperience,
        maxExperience,
        // Add other dynamic metadata 
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.listAstrologers = async (req, res, next) => {
  try {
    const {
      specialization,
      language,
      minExperience,
      maxCost,
      status,
      verified,
      tag,
      search,
      minRating,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    // Build matchStage
    const matchStage = {};

    if (specialization) {
      matchStage['specializations.specialization._id'] = new mongoose.Types.ObjectId(specialization);
    }

    if (language) {
      matchStage.languages = language;
    }

    if (minExperience) {
      matchStage.experience = { $gte: parseInt(minExperience) };
    }

    if (maxCost) {
      matchStage.costPerMinute = { $lte: parseInt(maxCost) };
    }

    if (status === 'online') {
      matchStage.$or = [
        { chatStatus: 'online' },
        { callStatus: 'online' }
      ];
    }

    if (verified) {
      matchStage.verification = 'verified';
    }

    if (tag) {
      matchStage.tag = tag;
    }

    if (search) {
      matchStage['user.name'] = { $regex: search, $options: 'i' };
    }

    if (minRating) {
      matchStage.averageRating = { $gte: parseFloat(minRating) };
    }

    // Build sortStage
    let sortStage = {};
    switch (sort) {
      case 'rating':
        sortStage = { averageRating: -1 };
        break;
      case 'experience':
        sortStage = { experience: -1 };
        break;
      case 'cost':
        sortStage = { costPerMinute: 1 };
        break;
      case 'consultations':
        sortStage = { totalConsultations: -1 };
        break;
      default:
        sortStage = { createdAt: -1 };
    }

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skipNumber = (pageNumber - 1) * limitNumber;

    const aggregationPipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'specializations',
          localField: 'specializations.specialization',
          foreignField: '_id',
          as: 'populatedSpecs'
        }
      },
      {
        $addFields: {
          specializations: {
            $map: {
              input: '$specializations',
              as: 'spec',
              in: {
                specialization: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$populatedSpecs',
                        as: 'popSpec',
                        cond: { $eq: ['$$popSpec._id', '$$spec.specialization'] }
                      }
                    },
                    0
                  ]
                },
                yearsOfExperience: '$$spec.yearsOfExperience',
                certificates: '$$spec.certificates'
              }
            }
          }
        }
      },
      { $project: { populatedSpecs: 0 } },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'astrologerId',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          averageRating: { $ifNull: [ { $avg: '$reviews.rating' }, 0 ] },
          totalReviews: { $size: '$reviews' },
          ratingDistribution: {
            1: { $size: { $filter: { input: '$reviews', as: 'review', cond: { $eq: ['$$review.rating', 1] } } } },
            2: { $size: { $filter: { input: '$reviews', as: 'review', cond: { $eq: ['$$review.rating', 2] } } } },
            3: { $size: { $filter: { input: '$reviews', as: 'review', cond: { $eq: ['$$review.rating', 3] } } } },
            4: { $size: { $filter: { input: '$reviews', as: 'review', cond: { $eq: ['$$review.rating', 4] } } } },
            5: { $size: { $filter: { input: '$reviews', as: 'review', cond: { $eq: ['$$review.rating', 5] } } } }
          }
        }
      },
      { $match: matchStage },
      {
        $facet: {
          metadata: [
            { $count: "total" },
            { $addFields: { 
              page: pageNumber,
              limit: limitNumber,
              totalPages: { $ceil: { $divide: [ "$total", limitNumber ] } }
            } }
          ],
          data: [
            { $sort: sortStage },
            { $skip: skipNumber },
            { $limit: limitNumber },
            {
              $project: {
                'user.password': 0,
                'user.role': 0,
                'user.createdAt': 0,
                'user.updatedAt': 0,
                'reviews': 0,
                '__v': 0
              }
            }
          ]
        }
      }
    ];

    const result = await Astrologer.aggregate(aggregationPipeline);
    const metadata = result[0].metadata.length ? result[0].metadata[0] : { total: 0, page: pageNumber, limit: limitNumber, totalPages: 0 };
    const astrologers = result[0].data;

    res.status(200).json({
      success: true,
      total: metadata.total,
      page: metadata.page,
      limit: metadata.limit,
      totalPages: metadata.totalPages,
      data: astrologers
    });
  } catch (error) {
    next(error);
  }
};

exports.getAstrologerProfile = async (req, res, next) => {
  try {
    const astrologer = await Astrologer.findById(req.params.id)
      .populate('userId', 'name avatar')
      .populate('specializations.specialization');

    if (!astrologer) {
      return next(errorHandler(404, 'Astrologer not found'));
    }

    const reviews = await Review.find({ astrologerId: req.params.id })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });

    const ratingStats = {
      average: 0,
      total: reviews.length,
      distribution: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      }
    };

    reviews.forEach(review => {
      ratingStats.distribution[review.rating]++;
    });

    if (reviews.length > 0) {
      ratingStats.average = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    }

    res.status(200).json({
      astrologer,
      reviews,
      ratingStats
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAstrologerProfile = async (req, res, next) => {
  try {
    const { astrologerId } = req.params;

    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return next(errorHandler(404, 'Astrologer not found'));
    }

    if (req.body.specializations) {
      for (const spec of req.body.specializations) {
        const specializationExists = await Specialization.findById(spec.specialization);
        if (!specializationExists) {
          return next(errorHandler(404, `Specialization ${spec.specialization} not found`));
        }
      }

      astrologer.specializations = req.body.specializations;
    }

    for (let key in req.body) {
      if (key !== 'specializations' && req.body.hasOwnProperty(key)) {
        astrologer[key] = req.body[key];
      }
    }

    await astrologer.save();

    const updatedAstrologer = await Astrologer.findById(astrologerId)
      .populate('specializations.specialization')
      .populate('userId', 'name avatar');

    res.status(200).json(updatedAstrologer);
  } catch (error) {
    next(error);
  }
};