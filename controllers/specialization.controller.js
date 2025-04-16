const Specialization = require('../models/specialization.model');
const errorHandler = require('../utils/error');

exports.createSpecialization = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Check if specialization already exists
    const existingSpecialization = await Specialization.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingSpecialization) {
      return next(errorHandler(400, 'Specialization already exists'));
    }

    const specialization = new Specialization({
      name,
      description,
      createdBy: req.user.id
    });

    await specialization.save();
    res.status(201).json(specialization);
  } catch (error) {
    next(error);
  }
};

exports.getAllSpecializations = async (req, res, next) => {
    try {
      const specializations = await Specialization.find()
        .populate('createdBy', 'name');
      res.status(200).json(specializations);
    } catch (error) {
      next(error);
    }
  };

// Update astrologer.controller.js to include specialization management
module.exports.updateAstrologerSpecializations = async (req, res, next) => {
    try {
        const { specializationId, yearsOfExperience, certificates } = req.body;

        // Verify the astrologer
        const astrologer = await Astrologer.findOne({ userId: req.user.id });
        if (!astrologer) {
            return next(errorHandler(404, 'Astrologer not found'));
        }

        // Verify the specialization exists
        const specialization = await Specialization.findById(specializationId);
        if (!specialization) {
            return next(errorHandler(404, 'Specialization not found'));
        }

        // Check if specialization already added
        const specializationExists = astrologer.specializations.some(
            spec => spec.specialization.toString() === specializationId
        );

        if (specializationExists) {
            // Update existing specialization
            const updatedSpecializations = astrologer.specializations.map(spec => {
                if (spec.specialization.toString() === specializationId) {
                    return {
                        ...spec,
                        yearsOfExperience,
                        certificates: certificates || spec.certificates
                    };
                }
                return spec;
            });

            astrologer.specializations = updatedSpecializations;
        } else {
            // Add new specialization
            astrologer.specializations.push({
                specialization: specializationId,
                yearsOfExperience,
                certificates: certificates || []
            });
        }

        await astrologer.save();

        // Populate the response
        const populatedAstrologer = await Astrologer.findById(astrologer._id)
            .populate('specializations.specialization')
            .populate('userId', 'name avatar');

        res.status(200).json(populatedAstrologer);
    } catch (error) {
        next(error);
    }
};

module.exports.removeAstrologerSpecialization = async (req, res, next) => {
    try {
        const { specializationId } = req.params;

        const astrologer = await Astrologer.findOne({ userId: req.user.id });
        if (!astrologer) {
            return next(errorHandler(404, 'Astrologer not found'));
        }

        astrologer.specializations = astrologer.specializations.filter(
            spec => spec.specialization.toString() !== specializationId
        );

        await astrologer.save();
        res.status(200).json({ message: 'Specialization removed successfully' });
    } catch (error) {
        next(error);
    }
};


exports.deleteSpecialization = async (req, res, next) => {
  try {
    const { id } = req.params; // expecting the specialization ID in route parameter

    // Attempt to find and delete the specialization by its ID
    const specialization = await Specialization.findByIdAndDelete(id);

    if (!specialization) {
      return next(errorHandler(404, 'Specialization not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Specialization deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};