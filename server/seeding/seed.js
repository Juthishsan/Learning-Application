const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');

dotenv.config();

const courses = [
    {
        title: "Machine Learning A-Z™: AI, Python & R",
        category: "Data Science",
        rating: 4.8,
        price: 89.99,
        instructor: "Dr. Angela Yu",
        description: "Learn to create Machine Learning Algorithms in Python and R from two Data Science experts.",
        thumbnail: "🤖"
    },
    {
        title: "The Complete 2024 Web Development Bootcamp",
        category: "Development",
        rating: 4.9,
        price: 94.99,
        instructor: "Jose Portilla",
        description: "Become a Full-Stack Web Developer with just one course. HTML, CSS, Javascript, Node, React, MongoDB.",
        thumbnail: "💻"
    },
    {
        title: "UX/UI Design Masterclass",
        category: "Design",
        rating: 4.7,
        price: 74.99,
        instructor: "Abby Covert",
        description: "Start your career as a UI/UX Designer. Theory, wireframes, prototypes, and more.",
        thumbnail: "🎨"
    },
    {
        title: "Python for Data Science and Machine Learning",
        category: "Data Science",
        rating: 4.6,
        price: 84.99,
        instructor: "Jose Portilla",
        description: "Learn how to use NumPy, Pandas, Seaborn , Matplotlib , Plotly , Scikit-Learn , Machine Learning, Tensorflow , and more!",
        thumbnail: "🐍"
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/learning-platform');
        console.log('MongoDB Connected');

        await Course.deleteMany({});
        console.log('Cleared existing courses');

        await Course.insertMany(courses);
        console.log('Added initial courses');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
