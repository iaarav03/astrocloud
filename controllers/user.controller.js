const bcryptjs = require('bcryptjs');
const User = require('../models/user.model.js');
const errorHandler = require('../utils/error');

module.exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};


module.exports.updateUser = async (req, res, next) => {
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};


module.exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'none',
      secure: true
    });
    res.status(200).json('User has been deleted!');
  } catch (error) {
    next(error);
  }
};

// Admin Conrollers

exports.searchProfiles = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return next(errorHandler(400, 'Query parameter is required'));
    }
    // Search across name, username, and email (case-insensitive)
    const regex = new RegExp(query, 'i');
    const users = await User.find({
      $or: [
        { name: regex },
        { username: regex },
        { email: regex }
      ]
    }).select('-password');

    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

exports.listAllProfiles = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

exports.getProfileById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.deleteProfileById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};