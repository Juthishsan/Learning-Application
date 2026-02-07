const express = require('express');
const router = express.Router();
const Instructor = require('../models/Instructor');
const ActivityLog = require('../models/ActivityLog');
const { courseUpload } = require('../config/cloudinary'); 
// Reusing courseUpload for now as it handles images, though a dedicated one might be better eventually. 
// Assuming 'courseUpload' allows images.

const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all instructors
router.get('/', async (req, res) => {
    try {
        const instructors = await Instructor.find().sort({ createdAt: -1 });
        res.json(instructors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a new instructor
router.post('/', async (req, res) => {
    try {
        const { name, email, designation, bio, expertise, image, password } = req.body;
        
        // Basic validation
        if (!name || !email || !designation || !password) {
            return res.status(400).json({ msg: 'Please enter all required fields including password' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }

        // Create User account for login
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'instructor', // Grant instructor role
            bio: bio || '',
            // image: image // User model validation might vary, keeping simple
        });

        await user.save();

        // Create Instructor Profile
        const newInstructor = new Instructor({
            name,
            email,
            designation,
            bio,
            expertise: Array.isArray(expertise) ? expertise : expertise.split(',').map(skill => skill.trim()),
            image
        });

        const instructor = await newInstructor.save();

        const log = new ActivityLog({
            action: 'INSTRUCTOR_ADDED',
            description: `New instructor '${instructor.name}' added with user account`,
            entityId: instructor._id,
            entityName: instructor.name
        });
        await log.save();

        res.json(instructor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete instructor
router.delete('/:id', async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id);
        if (!instructor) return res.status(404).json({ msg: 'Instructor not found' });

        // Delete associated User account
        await User.findOneAndDelete({ email: instructor.email });

        await Instructor.findByIdAndDelete(req.params.id);

        const log = new ActivityLog({
            action: 'INSTRUCTOR_REMOVED',
            description: `Instructor '${instructor.name}' and user account removed`,
            entityId: req.params.id,
            entityName: instructor.name
        });
        await log.save();

        res.json({ msg: 'Instructor removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
