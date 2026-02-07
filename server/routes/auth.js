const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
    });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Log Activity
    const log = new ActivityLog({
        action: 'USER_REGISTERED',
        description: `New user ${name} registered`,
        entityId: user._id,
        entityName: name
    });
    await log.save();

    res.status(201).json({ msg: 'User registered successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Login User (Checks both User and Admin collections)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check User Collection
    let user = await User.findOne({ email });
    
    if (user) {
        let isMatch = false;
        // Check if hashed
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            // Legacy plain text check
            isMatch = (password === user.password);
            
            // Optional: Migrate to hash if matched
            if (isMatch) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
                await user.save();
            }
        }

        if (!isMatch) {
             return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        return res.json({ 
            msg: 'Login successful', 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role, 
                createdAt: user.createdAt,
                phone: user.phone,
                location: user.location,
                bio: user.bio,
                socialLinks: user.socialLinks
            } 
        });
    }

    // 2. Check Admin Collection if not found in User
    let admin = await Admin.findOne({ email });

    if (admin) {
        // Simple plain text for admin based on existing structure (or can add hash logic too)
        if (admin.password !== password) {
             return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        return res.json({ msg: 'Admin Login successful', user: { id: admin._id, name: admin.name, email: admin.email, role: 'admin', createdAt: admin.createdAt } });
    }

    // 3. User not found in either
    return res.status(400).json({ msg: 'Invalid Credentials' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
