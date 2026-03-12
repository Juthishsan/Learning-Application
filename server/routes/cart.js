const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Stripe not fully configured yet

// @route   POST api/cart/:userId
// @desc    Add course to cart
// @access  Private
router.post('/:userId', async (req, res) => {
    try {
        const { courseId } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if already in cart
        if (user.cart.includes(courseId)) {
            return res.status(400).json({ msg: 'Course already in cart' });
        }

        // Check if already enrolled
        const isEnrolled = user.enrolledCourses.some(e => e.courseId.toString() === courseId);
        if (isEnrolled) {
            return res.status(400).json({ msg: 'You are already enrolled in this course' });
        }

        user.cart.push(courseId);
        await user.save();

        res.json(user.cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/cart/:userId
// @desc    Get user's cart
// @access  Private
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('cart');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user.cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/cart/:userId/:courseId
// @desc    Remove course from cart
// @access  Private
router.delete('/:userId/:courseId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.cart = user.cart.filter(id => id.toString() !== req.params.courseId);
        await user.save();

        // return the updated cart (populated ideally, but standard ID list is fine for quick UI updates if we re-fetch)
        // actually let's just return IDs or populate if needed. frontend likely refills.
        const populatedUser = await User.findById(req.params.userId).populate('cart');
        res.json(populatedUser.cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/cart/:userId/checkout
// @desc    Checkout all items in cart
// @access  Private
router.post('/:userId/checkout', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('cart');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (user.cart.length === 0) {
            return res.status(400).json({ msg: 'Cart is empty' });
        }

        // Logic to enroll in all courses
        // 1. Filter out courses already enrolled (double check)
        const coursesToEnroll = user.cart.filter(course => 
            !user.enrolledCourses.some(enrollment => enrollment.courseId.toString() === course._id.toString())
        );

        // 2. Add to enrolledCourses
        coursesToEnroll.forEach(course => {
            user.enrolledCourses.push({
                courseId: course._id,
                progress: 0,
                completedContent: [],
                assignments: [],
                quizzes: []
            });
        });

        // 3. Clear cart
        user.cart = [];
        await user.save();

        res.json({ msg: 'Checkout successful', enrolledCourses: user.enrolledCourses });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
