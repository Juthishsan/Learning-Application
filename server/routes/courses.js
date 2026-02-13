const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a course
router.post('/', async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    const course = await newCourse.save();

    const log = new ActivityLog({
        action: 'COURSE_CREATED',
        description: `New course '${course.title}' created`,
        entityId: course._id,
        entityName: course.title
    });
    await log.save();

    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get single course
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if(!course) return res.status(404).json({ msg: 'Course not found'});
        res.json(course);
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId') return res.status(404).json({ msg: 'Course not found'});
        res.status(500).send('Server Error');
    }
});

// Update a course
router.put('/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        const log = new ActivityLog({
            action: 'COURSE_UPDATED',
            description: `Course '${course.title}' updated`,
            entityId: course._id,
            entityName: course.title
        });
        await log.save();

        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a course
router.delete('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
             return res.status(404).json({ msg: 'Course not found' });
        }

        // Delete all content files from Cloudinary
        if (course.content && course.content.length > 0) {
            for (const item of course.content) {
                if (item.public_id) {
                     await cloudinary.uploader.destroy(item.public_id, { resource_type: item.type === 'video' ? 'video' : 'image' });
                }
            }
        }

        await Course.findByIdAndDelete(req.params.id);
        
        // Note: Can't get title easily if deleted, but logging deletion is good practice
        const log = new ActivityLog({
            action: 'COURSE_DELETED',
            description: `Course '${course.title}' (ID: ${req.params.id}) deleted`,
            entityId: req.params.id,
            entityName: course.title
        });
        await log.save();

        res.json({ msg: 'Course removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Cloudinary Config for Courses
const { courseUpload, cloudinary } = require('../config/cloudinary');

// @route   POST api/courses/:id/content
// @desc    Upload course content (video/pdf)
// @access  Admin
router.post('/:id/content', courseUpload.single('file'), async (req, res) => {
    try {
        const { title, type } = req.body;
        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        if (req.file && req.file.path) {
            const newContent = {
                title: title || req.file.originalname,
                type: type || 'pdf', // default fallback
                url: req.file.path,
                public_id: req.file.filename,
                fileName: req.file.originalname
            };

            course.content.push(newContent);
            await course.save();

            const log = new ActivityLog({
                action: 'CONTENT_ADDED',
                description: `Material '${newContent.title}' added to course '${course.title}'`,
                entityId: course._id,
                entityName: course.title
            });
            await log.save();

            res.json(course.content);
        } else {
            res.status(400).send('Upload failed');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/courses/:id/assignments
// @desc    Add an assignment
router.post('/:id/assignments', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        const newAssignment = req.body; // { title, description, dueDate }
        course.assignments.push(newAssignment);
        await course.save();

        res.json(course.assignments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/courses/:id/assignments/:assignId
// @desc    Delete an assignment
router.delete('/:id/assignments/:assignId', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        course.assignments = course.assignments.filter(a => a._id.toString() !== req.params.assignId);
        await course.save();

        res.json(course.assignments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/courses/:id/quizzes
// @desc    Add a quiz
router.post('/:id/quizzes', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        // Expected body: { title, questions: [{ question, options: [], correctAnswer }] }
        const newQuiz = req.body; 
        course.quizzes.push(newQuiz);
        await course.save();

        res.json(course.quizzes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/courses/:id/quizzes/:quizId
// @desc    Delete a quiz
router.delete('/:id/quizzes/:quizId', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        course.quizzes = course.quizzes.filter(q => q._id.toString() !== req.params.quizId);
        await course.save();

        res.json(course.quizzes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/courses/:id/content/:contentId
// @desc    Delete a content item
router.delete('/:id/content/:contentId', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        // Logic to delete from Cloudinary
        const contentItem = course.content.find(item => item._id.toString() === req.params.contentId);
        
        if (contentItem && contentItem.public_id) {
             try {
                // Determine resource type based on file type
                const resourceType = contentItem.type === 'video' ? 'video' : 'image'; 
                // Note: 'image' resource type handles both images and PDFs in many Cloudinary configs, 
                // but checking exact type is safer if raw files are used. 
                // For this app, we assume pdfs/images are 'image' or 'raw' usually, but 'image' is default for PDF previews.
                 await cloudinary.uploader.destroy(contentItem.public_id, { resource_type: resourceType });
             } catch (cloudErr) {
                 console.error("Cloudinary Deletion Error:", cloudErr);
                 // Continue to delete from DB even if Cloudinary fails
             }
        }

        course.content = course.content.filter(item => item._id.toString() !== req.params.contentId);
        await course.save();

        res.json(course.content);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/courses/:id/gradebook
// @desc    Get all students and their grades for a course
router.get('/:id/gradebook', async (req, res) => {
    try {
        const courseId = req.params.id;
        
        // Find users enrolled in this course
        // Note: This relies on the structure of enrolledCourses array in User model
        const students = await User.find({
            'enrolledCourses.courseId': courseId
        }).select('name email enrolledCourses');

        // Transform data to send only relevant course info per student
        const gradebook = students.map(student => {
            const enrollment = student.enrolledCourses.find(
                e => e.courseId.toString() === courseId
            );
            
            return {
                studentId: student._id,
                name: student.name,
                email: student.email,
                progress: enrollment.progress,
                assignments: enrollment.assignments,
                quizzes: enrollment.quizzes
            };
        });

        res.json(gradebook);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
