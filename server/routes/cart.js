const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_w3hVp8h98q2s3M',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '2nE19UuL9p3rTnPzQoW9821h',
});

// @route   GET api/cart/config/razorpay
// @desc    Get Razorpay SDK key
// @access  Public
router.get('/config/razorpay', (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID || 'rzp_test_w3hVp8h98q2s3M' });
});

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

        if (user.cart.includes(courseId)) {
            return res.status(400).json({ msg: 'Course already in cart' });
        }

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

        const populatedUser = await User.findById(req.params.userId).populate('cart');
        res.json(populatedUser.cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/cart/:userId/create-order
// @desc    Create Razorpay Order
// @access  Private
router.post('/:userId/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency: "INR",
            receipt: `rcpt_${Date.now().toString(36)}`
        };

        const order = await razorpay.orders.create(options);
        if (!order) {
            return res.status(500).json({ msg: "Some error occured" });
        }

        res.json(order);
    } catch (error) {
        console.error("Razorpay order error:", error);
        res.status(500).json({ msg: 'Error creating Razorpay order', error });
    }
});

// @route   POST api/cart/:userId/verify-payment
// @desc    Verify Razorpay Payment and enroll
// @access  Private
router.post('/:userId/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '2nE19UuL9p3rTnPzQoW9821h')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment is verified
            const user = await User.findById(req.params.userId).populate('cart');
            if (!user) return res.status(404).json({ msg: 'User not found' });
            
            const coursesToEnroll = user.cart.filter(course => 
                !user.enrolledCourses.some(enrollment => enrollment.courseId.toString() === course._id.toString())
            );

            coursesToEnroll.forEach(course => {
                user.enrolledCourses.push({
                    courseId: course._id,
                    progress: 0,
                    completedContent: [],
                    assignments: [],
                    quizzes: []
                });
            });

            user.cart = [];
            await user.save();

            return res.status(200).json({ msg: "Payment verified successfully", enrolledCourses: user.enrolledCourses });
        } else {
            return res.status(400).json({ msg: "Invalid signature sent!" });
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({ msg: "Internal Server Error!" });
    }
});

// Kept for backward compatibility or direct mock checkouts
router.post('/:userId/checkout', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('cart');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (user.cart.length === 0) {
            return res.status(400).json({ msg: 'Cart is empty' });
        }

        const coursesToEnroll = user.cart.filter(course => 
            !user.enrolledCourses.some(enrollment => enrollment.courseId.toString() === course._id.toString())
        );

        coursesToEnroll.forEach(course => {
            user.enrolledCourses.push({
                courseId: course._id,
                progress: 0,
                completedContent: [],
                assignments: [],
                quizzes: []
            });
        });

        user.cart = [];
        await user.save();

        res.json({ msg: 'Checkout successful', enrolledCourses: user.enrolledCourses });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
