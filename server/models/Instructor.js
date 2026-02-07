const mongoose = require('mongoose');

const InstructorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  designation: {
    type: String, // e.g., "Senior Software Engineer"
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  expertise: {
    type: [String], // Array of skills e.g., ["React", "Node.js"]
    required: true
  },
  image: {
    type: String,
    default: '' // URL from Cloudinary or placeholder
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Instructor', InstructorSchema);
