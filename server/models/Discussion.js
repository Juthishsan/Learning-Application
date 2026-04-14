const mongoose = require('mongoose');

const DiscussionSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  category: { type: String, default: 'General' }, // E.g., Module 1, Midterm Exam, FAQ
  replies: [
    {
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      authorName: { type: String, required: true },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    }
  ],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Discussion', DiscussionSchema);
