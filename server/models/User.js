const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student',
  },
  enrolledCourses: [
    {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      progress: {
        type: Number,
        default: 0,
      },
      assignments: [
        {
            assignmentId: String,
            score: Number,
            submissionUrl: String,
            fileName: String,
            completedAt: { type: Date, default: Date.now }
        }
      ],
      quizzes: [
          {
              quizId: String, // ID of the quiz from the Course model
              score: Number,
              completedAt: { type: Date, default: Date.now }
          }
      ],
      completedContent: [
          { type: String } // Store IDs of completed video/pdf content
      ]
    }
  ],
  preferences: {
    field: { type: String, default: '' },
    occupation: { type: String, default: '' },
    skills: [{ type: String }]
  },
  bio: {
    type: String,
    default: '',
  },
  resume: {
    type: String, // URL to cloud storage or path
    default: '',
  },
  socialLinks: {
    website: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
