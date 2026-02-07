const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');

// Get Dashboard Stats
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'student' });
        const totalCourses = await Course.countDocuments();

        // Calculate total valid enrollments (only count if course exists)
        const validEnrollmentsAgg = await User.aggregate([
            { $unwind: "$enrolledCourses" },
            { $lookup: { from: "courses", localField: "enrolledCourses.courseId", foreignField: "_id", as: "courseDetails" } },
            { $match: { "courseDetails": { $ne: [] } } }, // Only count if course still exists
            { $count: "total" }
        ]);
        const totalEnrollments = validEnrollmentsAgg.length > 0 ? validEnrollmentsAgg[0].total : 0;

        // Calculate User Growth Key using CreatedAt
        // Note: MongoDB $dateToString helps group by month/year
        const userGrowth = await User.aggregate([
             {
                 $group: {
                     _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                     count: { $sum: 1 }
                 }
             },
             { $sort: { _id: 1 } },
             { $limit: 12 }
        ]);

        // Calculate Course Distribution (Top 5 popular courses)
        const courseDistribution = await User.aggregate([
            { $unwind: "$enrolledCourses" },
            { $group: { _id: "$enrolledCourses.courseId", count: { $sum: 1 } } },
            { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
            { $unwind: "$course" },
            { $project: { name: "$course.title", value: "$count" } },
            { $sort: { value: -1 } },
            { $limit: 5 }
        ]);

        // Fetch Recent Activity
        const recentActivity = await ActivityLog.find().sort({ createdAt: -1 }).limit(5);

        res.json({ 
            totalUsers, 
            totalCourses, 
            totalEnrollments,
            userGrowth,
            courseDistribution,
            recentActivity
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get All Users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete User
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
