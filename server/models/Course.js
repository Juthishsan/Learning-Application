const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  instructor: {
    type: String,
    required: true,
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (who is an instructor)
  },
  price: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String, // URL to image or icon definition
  },
  lessons: [
    {
      title: String,
      content: String,
      duration: Number, // in minutes
    }
  ],
  content: [
      {
          title: String,
          type: { type: String, enum: ['video', 'pdf', 'image'] },
          url: String,
          public_id: String,
          fileName: String
      }
  ],
  assignments: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        dueDate: { type: Date },
        createdAt: { type: Date, default: Date.now }
      }
  ],
  quizzes: [
      {
        title: { type: String, required: true },
        questions: [
          {
            question: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctAnswer: { type: Number, required: true } // Index of the correct option (0-3)
          }
        ],
        createdAt: { type: Date, default: Date.now }
      }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Course', CourseSchema);
