const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get all notifications for a user
router.get('/:userId', async (req, res) => {
    try {
        let notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Mark all as read
router.put('/mark-read/:userId', async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.params.userId, unread: true },
            { $set: { unread: false } }
        );
        res.json({ msg: 'Notifications marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Mark single notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ msg: 'Notification not found' });
        
        notification.unread = false;
        await notification.save();
        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete single notification
router.delete('/:id', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).json({ msg: 'Notification not found' });
        
        res.json({ msg: 'Notification removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Send announcement from instructor
router.post('/announce', async (req, res) => {
    try {
        const { title, message, courseId, instructorName } = req.body;
        
        if (!title || !message || !instructorName) {
            return res.status(400).json({ msg: 'Please provide all fields' });
        }

        const User = require('../models/User');
        const Course = require('../models/Course');

        let targetStudents = [];

        if (courseId) {
            // Find students enrolled in specific course
            targetStudents = await User.find({ 'enrolledCourses.courseId': courseId });
        } else {
            // Find all students enrolled in ANY of this instructor's courses
            const instructorCourses = await Course.find({ instructor: instructorName });
            const courseIds = instructorCourses.map(c => c._id);
            
            targetStudents = await User.find({ 
                'enrolledCourses.courseId': { $in: courseIds } 
            });
        }

        // Deduplicate students just in case (though Mongo find with $in already handles this mostly)
        const uniqueStudentIds = [...new Set(targetStudents.map(s => s._id.toString()))];

        if (uniqueStudentIds.length === 0) {
            return res.status(400).json({ msg: 'No enrolled students found to send announcement to.' });
        }

        const notifications = uniqueStudentIds.map(userId => ({
            userId: userId,
            title: `Announcement: ${title}`,
            message: `${instructorName}: ${message}`,
            type: 'system', // the 'i' icon, or you could create a specific 'announcement' type
            unread: true
        }));

        await Notification.insertMany(notifications);

        res.json({ msg: `Announcement sent to ${uniqueStudentIds.length} learners.` });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
