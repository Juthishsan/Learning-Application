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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Course', CourseSchema);
