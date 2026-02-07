const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

dotenv.config();

const adminUser = {
    name: "System Admin",
    email: "admin@eduverse.com",
    password: "adminpassword", // In production, hash this!
    role: "admin"
};

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/learning-platform');
        console.log('MongoDB Connected');

        // Check if admin exists
        const exists = await Admin.findOne({ email: adminUser.email });
        if (exists) {
            console.log('Admin already exists');
        } else {
            await Admin.create(adminUser);
            console.log('Admin created successfully');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
