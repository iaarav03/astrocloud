const mongoose = require("mongoose");

const astrologerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    tag: {
      type: String,
      enum: [null, 'Celebrity'],
      default: null
    },
    verification: {
      type: String,
      enum: [null, 'verified'],
      default: null
    },
    specializations: [{
      specialization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Specialization'
      },
      yearsOfExperience: {
        type: Number,
        required: true
      },
      certificates: [{
        name: String,
        url: String,
        verificationStatus: {
          type: String,
          enum: ['pending', 'verified', 'rejected'],
          default: 'pending'
        }
      }]
    }],
    languages: [{
      type: String,
      required: true
    }],
    experience: {
      type: Number,
      required: true
    },
    costPerMinute: {
      type: Number,
      required: true
    },
    chatMinutes: {
      type: Number,
      default: 0
    },
    callMinutes: {
      type: Number,
      default: 0
    },
    chatStatus: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline'
    },
    callStatus: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline'
    },
    about: {
      type: String,
      required: true
    },
    totalConsultations: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Astrologer', astrologerSchema);