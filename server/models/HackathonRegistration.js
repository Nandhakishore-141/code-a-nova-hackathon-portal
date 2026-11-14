const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema(
  {
    memberName: {
      type: String,
      required: [true, 'Team member name is required'],
      trim: true,
      minlength: [3, 'Member name must be at least 3 characters'],
    },
    memberEmail: {
      type: String,
      required: [true, 'Team member email is required'],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Please provide a valid member email'],
    },
  },
  { _id: false }
);

const hackathonRegistrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    registrationCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [3, 'Full name must be at least 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'],
    },
    collegeName: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      trim: true,
    },
    yearOfStudy: {
      type: String,
      required: [true, 'Year of study is required'],
      trim: true,
    },
    domain: {
      type: String,
      required: [true, 'Domain / track is required'],
      trim: true,
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [5, 'Project name must be at least 5 characters'],
    },
    pptLink: {
      type: String,
      required: [true, 'PPT link is required'],
      trim: true,
    },
    prototypeLink: {
      type: String,
      required: [true, 'Prototype link is required'],
      trim: true,
    },
    demoVideoLink: {
      type: String,
      trim: true,
      default: '',
    },
    teamSize: {
      type: Number,
      required: [true, 'Team size is required'],
      min: [1, 'Team size must be at least 1'],
      max: [5, 'Team size cannot exceed 5'],
    },
    teamMembers: {
      type: [teamMemberSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Shortlisted'],
      default: 'Submitted',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HackathonRegistration', hackathonRegistrationSchema);

