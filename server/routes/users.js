const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');

// Enroll in a Course
router.post('/enroll', async (req, res) => {
    try {
        const { userId, courseId } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Check if already enrolled
        const isEnrolled = user.enrolledCourses.some(
            enrollment => enrollment.courseId.toString() === courseId
        );

        if (isEnrolled) {
            return res.status(400).json({ msg: 'Already enrolled in this course' });
        }

        user.enrolledCourses.push({ courseId, progress: 0 });
        await user.save();

        res.json({ msg: 'Enrolled successfully', enrolledCourses: user.enrolledCourses });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Submit Assignment
router.post('/:userId/courses/:courseId/assignment', async (req, res) => {
    try {
        const { assignmentId, score } = req.body;
        const user = await User.findById(req.params.userId);
        
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const enrollment = user.enrolledCourses.find(
            e => e.courseId.toString() === req.params.courseId || (e.courseId._id && e.courseId._id.toString() === req.params.courseId)
        );

        if (!enrollment) {
            return res.status(404).json({ msg: 'Course enrollment not found' });
        }

        // Check if assignment already exists
        const existingAssign = enrollment.assignments.find(a => a.assignmentId === assignmentId);
        if (existingAssign) {
            existingAssign.score = score; // Update score (retake logic)
            existingAssign.completedAt = Date.now();
        } else {
            enrollment.assignments.push({ assignmentId, score });
        }

        await user.save();
        res.json({ msg: 'Assignment saved', assignments: enrollment.assignments });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Mark Content as Complete/Incomplete
router.post('/:userId/courses/:courseId/complete', async (req, res) => {
    try {
        const { contentId } = req.body; // The ID of the video/resource
        const user = await User.findById(req.params.userId);
        const course = await Course.findById(req.params.courseId);

        if (!user || !course) return res.status(404).json({ msg: 'User or Course not found' });

        const enrollment = user.enrolledCourses.find(
            e => e.courseId.toString() === req.params.courseId || (e.courseId._id && e.courseId._id.toString() === req.params.courseId)
        );

        if (!enrollment) {
            return res.status(404).json({ msg: 'Not enrolled in this course' });
        }

        // Initialize user's completed content if undefined
        if (!enrollment.completedContent) {
           enrollment.completedContent = [];
        }

        // Toggle completion
        const idx = enrollment.completedContent.indexOf(contentId);
        if (idx > -1) {
            enrollment.completedContent.splice(idx, 1); // Unmark
        } else {
            enrollment.completedContent.push(contentId); // Mark
        }

        // Recalculate Progress
        // Total items = course.content.length + (assignments count if any, assuming 1 for now or 0)
        // For now, let's base it purely on course.content items (videos/pdfs)
        const totalItems = course.content.length;
        const completedItems = enrollment.completedContent.length;
        
        let newProgress = 0;
        if (totalItems > 0) {
            newProgress = Math.round((completedItems / totalItems) * 100);
        }
        
        enrollment.progress = newProgress;

        await user.save();
        res.json({ 
            msg: 'Progress updated', 
            completedContent: enrollment.completedContent,
            progress: enrollment.progress 
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get Enrolled Courses for a User
router.get('/:userId/courses', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('enrolledCourses.courseId');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.json(user.enrolledCourses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get User Details
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/users/:userId/preferences
// @desc    Update user learning preferences
// @access  Private
router.put('/:userId/preferences', async (req, res) => {
    try {
        const { field, occupation, managesPeople, skills } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.preferences = {
            field,
            occupation,
            skills
        };

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Cloudinary Upload Config
const { upload } = require('../config/cloudinary');

// @route   POST api/users/:userId/resume
// @desc    Upload user resume (PDF)
// @access  Private
router.post('/:userId/resume', upload.single('resume'), async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // req.file.secure_url contains the HTTPS Cloudinary URL
        if(req.file && (req.file.path || req.file.secure_url)) {
            user.resume = req.file.secure_url || req.file.path;
            await user.save();
            res.json({ msg: 'Resume uploaded', resume: user.resume });
        } else {
            res.status(400).send('Upload failed');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/users/:userId/profile
// @desc    Update user profile details (bio, social links, etc)
// @access  Private
router.put('/:userId/profile', async (req, res) => {
    try {
        const { name, bio, socialLinks, resume, phone, location } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (location !== undefined) user.location = location;
        if (bio !== undefined) user.bio = bio;
        if (resume !== undefined) user.resume = resume;
        
        // Merge or overwrite social links properly
        if (socialLinks) {
            user.socialLinks = { 
                ...user.socialLinks, 
                ...socialLinks 
            };
        }

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/users/:userId/password
// @desc    Update user password
// @access  Private
router.put('/:userId/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if current password matches (Plain text OR Hash)
        let isMatch = false;
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(currentPassword, user.password);
        } else {
             isMatch = (currentPassword === user.password);
        }

        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect current password' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
