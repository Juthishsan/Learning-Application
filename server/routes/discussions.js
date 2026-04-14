const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');

// Get all discussions for a specific course
router.get('/:courseId', async (req, res) => {
  try {
    const discussions = await Discussion.find({ courseId: req.params.courseId })
      .sort({ createdAt: -1 });
    res.json(discussions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a new discussion thread
router.post('/', async (req, res) => {
  const { courseId, title, content, author, authorName, category } = req.body;
  try {
    const newDiscussion = new Discussion({
      courseId,
      title,
      content,
      author,
      authorName,
      category: category || 'General',
    });
    const discussion = await newDiscussion.save();
    res.json(discussion);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Post a reply to a discussion thread
router.post('/:discussionId/reply', async (req, res) => {
  const { author, authorName, content } = req.body;
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) return res.status(404).json({ msg: 'Discussion not found' });

    discussion.replies.push({ author, authorName, content });
    await discussion.save();
    res.json(discussion);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Toggle a like on a discussion
router.post('/:discussionId/like', async (req, res) => {
  const { userId } = req.body;
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) return res.status(404).json({ msg: 'Discussion not found' });

    const index = discussion.likes.indexOf(userId);
    if (index === -1) {
      discussion.likes.push(userId);
    } else {
      discussion.likes.splice(index, 1);
    }
    await discussion.save();
    res.json(discussion);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
