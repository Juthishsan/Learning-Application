const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { courseUpload, reviewUpload, cloudinary } = require('../config/cloudinary');
const { Groq } = require('groq-sdk');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Get all courses with student count
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().lean();
    
    const coursesWithCount = await Promise.all(courses.map(async (course) => {
        const studentCount = await User.countDocuments({
            'enrolledCourses.courseId': course._id
        });
        return { ...course, students: studentCount };
    }));

    res.json(coursesWithCount);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a course
router.post('/', courseUpload.single('thumbnail'), async (req, res) => {
  try {
    const courseData = req.body;
    
    // Handle thumbnail file
    if(req.file && req.file.path) {
        courseData.thumbnail = req.file.path;
    }

    const newCourse = new Course(courseData);
    const course = await newCourse.save();

    const log = new ActivityLog({
        action: 'COURSE_CREATED',
        description: `New course '${course.title}' created`,
        entityId: course._id,
        entityName: course.title
    });
    await log.save();

    // --- NEW: Notify all users about the new course ---
    const Notification = require('../models/Notification');
    const User = require('../models/User');

    // Notify users about new courses. For a real app, you might only notify users interested in certain categories.
    const allUsers = await User.find({ role: 'student' });
    const notifications = allUsers.map(user => ({
        userId: user._id,
        title: 'New Course Available',
        message: `'${course.title}' is now live! Check it out.`,
        type: 'course',
        unread: true
    }));

    if (notifications.length > 0) {
        await Notification.insertMany(notifications);
    }
    // ----------------------------------------

    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get single course with student count
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).lean();
        if(!course) return res.status(404).json({ msg: 'Course not found'});

        const studentCount = await User.countDocuments({
            'enrolledCourses.courseId': req.params.id
        });

        res.json({ ...course, students: studentCount });
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId') return res.status(404).json({ msg: 'Course not found'});
        res.status(500).send('Server Error');
    }
});

// Update a course
router.put('/:id', courseUpload.single('thumbnail'), async (req, res) => {
    try {
        const updateData = req.body;
        
        // Handle thumbnail file
        if(req.file && req.file.path) {
            updateData.thumbnail = req.file.path;
        }

        const course = await Course.findByIdAndUpdate(req.params.id, updateData, { new: true }).lean();
        
        const log = new ActivityLog({
            action: 'COURSE_UPDATED',
            description: `Course '${course.title}' updated`,
            entityId: course._id,
            entityName: course.title
        });
        await log.save();

        // Get student count for updated course response
        const studentCount = await User.countDocuments({
            'enrolledCourses.courseId': course._id
        });

        res.json({ ...course, students: studentCount });
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



// @route   POST api/courses/:id/content
// @desc    Upload course content (video/pdf)
// @access  Admin
router.post('/:id/content', courseUpload.single('file'), async (req, res) => {
    try {
            const { title, type, description } = req.body;
        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        if (req.file && req.file.path) {
            const newContent = {
                title: title || req.file.originalname,
                description: description || '',
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

            // --- NEW: Notify all enrolled students ---
            const Notification = require('../models/Notification');
            const User = require('../models/User');

            const students = await User.find({ 'enrolledCourses.courseId': course._id });
            
            const notifications = students.map(student => ({
                userId: student._id,
                title: 'New Course Material',
                message: `New material '${newContent.title}' has been added to ${course.title}.`,
                type: 'system', // or perhaps a new 'material' type if you want a custom icon
                unread: true
            }));

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
            // ----------------------------------------

            res.json(course.content);
        } else {
            res.status(400).send('Upload failed');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/courses/:id/content/:contentId
// @desc    Update course content
router.put('/:id/content/:contentId', courseUpload.single('file'), async (req, res) => {
    try {
        const { title, description, type } = req.body;
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        const contentItem = course.content.id(req.params.contentId);
        if (!contentItem) {
            return res.status(404).json({ msg: 'Content not found' });
        }

        // Update basic fields
        if (title) contentItem.title = title;
        if (description) contentItem.description = description;
        if (type) contentItem.type = type;

        // Handle file replacement
        if (req.file && req.file.path) {
            // Delete old file from Cloudinary
            if (contentItem.public_id) {
                try {
                     const resourceType = contentItem.type === 'video' ? 'video' : 'image';
                     await cloudinary.uploader.destroy(contentItem.public_id, { resource_type: resourceType });
                } catch (cloudErr) {
                    console.error("Cloudinary Deletion Error:", cloudErr);
                }
            }

            // Update with new file info
            contentItem.url = req.file.path;
            contentItem.public_id = req.file.filename;
            contentItem.fileName = req.file.originalname;
            contentItem.type = type || contentItem.type; // Update type if provided, else keep or infer? Better to likely update if file changed.
        }

        await course.save();
        res.json(course.content);

    } catch (err) {
        console.error(err.message);
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

        // --- NEW: Notify all enrolled students ---
        const Notification = require('../models/Notification');
        const User = require('../models/User');

        const students = await User.find({ 'enrolledCourses.courseId': course._id });
        
        const notifications = students.map(student => ({
            userId: student._id,
            title: 'Assignment Due',
            message: `A new assignment '${newAssignment.title}' has been added to ${course.title}. Due Date: ${newAssignment.dueDate ? new Date(newAssignment.dueDate).toLocaleDateString() : 'N/A'}.`,
            type: 'assignment',
            unread: true
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
        // ----------------------------------------

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

// @route   PUT api/courses/:id/assignments/:assignId
// @desc    Update an assignment
router.put('/:id/assignments/:assignId', async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        const assignment = course.assignments.id(req.params.assignId);
        if(!assignment) return res.status(404).json({ msg: 'Assignment not found' });

        if(title) assignment.title = title;
        if(description) assignment.description = description;
        if(dueDate) assignment.dueDate = dueDate;

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

// @route   PUT api/courses/:id/quizzes/:quizId
// @desc    Update a quiz
router.put('/:id/quizzes/:quizId', async (req, res) => {
    try {
        const { title, questions } = req.body;
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        const quiz = course.quizzes.id(req.params.quizId);
        if(!quiz) return res.status(404).json({ msg: 'Quiz not found' });

        if(title) quiz.title = title;
        if(questions) quiz.questions = questions;

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

// @route   POST api/courses/:id/content/bulk-delete
// @desc    Bulk delete content items
router.post('/:id/content/bulk-delete', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        const { contentIds } = req.body;
        if (!Array.isArray(contentIds)) return res.status(400).json({ msg: 'contentIds must be an array' });

        // Try to delete from Cloudinary for each item being deleted
        const itemsToDelete = course.content.filter(item => contentIds.includes(item._id.toString()));
        
        for (const item of itemsToDelete) {
             if (item.public_id) {
                  try {
                       const resourceType = item.type === 'video' ? 'video' : 'image';
                       await cloudinary.uploader.destroy(item.public_id, { resource_type: resourceType });
                  } catch (cloudErr) {
                       console.error("Cloudinary Bulk Deletion Error:", cloudErr);
                  }
             }
        }

        course.content = course.content.filter(item => !contentIds.includes(item._id.toString()));
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

// @route   POST api/courses/:id/content/:contentId/transcribe
// @desc    Generate AI transcript for a video using Groq Whisper
router.post('/:id/content/:contentId/transcribe', async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            console.warn("GROQ_API_KEY not found in .env. Falling back to Mock AI.");
            // Keep fallback logic for testing without key
            return res.json({
                _id: req.params.contentId,
                transcript: [
                    { startTime: 0, endTime: 5, text: "AI Key missing! This is a mock transcript." },
                    { startTime: 6, endTime: 15, text: "Please add GROQ_API_KEY to your .env to see real AI in action." }
                ]
            });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const course = await Course.findById(req.params.id);
        const contentItem = course.content.id(req.params.contentId);

        if (!contentItem || contentItem.type !== 'video') {
            return res.status(400).json({ msg: 'Invalid video content' });
        }

        // 1. Download video to temp file (Groq SDK requires a file stream/readable)
        const tempPath = path.join(os.tmpdir(), `transcribe-${req.params.contentId}.mp4`);
        const response = await axios({
            method: 'get',
            url: contentItem.url,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(tempPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // 2. Call Groq Whisper API
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(tempPath),
            model: "whisper-large-v3",
            response_format: "verbose_json", // This provides timestamps!
        });

        // 3. Process segments into our format
        const formattedTranscript = transcription.segments.map(seg => ({
            startTime: Math.floor(seg.start),
            endTime: Math.floor(seg.end),
            text: seg.text.trim()
        }));

        // 4. Cleanup and Save
        fs.unlinkSync(tempPath);
        contentItem.transcript = formattedTranscript;
        await course.save();

        res.json(contentItem);
    } catch (err) {
        console.error("Transcription Error:", err.message);
        res.status(500).json({ msg: 'AI Processing Failed', error: err.message });
    }
});

// @route   POST api/courses/:id/quizzes/generate
// @desc    Auto-generate quiz from PDF using AI
router.post('/:id/quizzes/generate', courseUpload.single('file'), async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            return res.status(400).json({ msg: 'GROQ_API_KEY missing in server .env' });
        }

        if (!req.file) {
            return res.status(400).json({ msg: 'No PDF file uploaded' });
        }
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        // 1. Fetch the PDF buffer content
        const pdfResponse = await axios.get(req.file.path, { responseType: 'arraybuffer' });
        const pdfBuffer = Buffer.from(pdfResponse.data);
        
        // 2. Extract text from PDF
        const pdfData = await pdfParse(pdfBuffer);
        const extractedText = pdfData.text.substring(0, 15000); // Limit to 15k chars for prompt safety

        if (!extractedText.trim()) {
            return res.status(400).json({ msg: 'Could not extract text from the PDF' });
        }

        // 3. Prompt Groq for Quiz Generation
        const prompt = `
            You are an expert educator. Based on the following educational content, generate a high-quality quiz with exactly 10 multiple-choice questions.
            
            Return ONLY a valid JSON array of objects with this structure:
            [
              {
                "question": "The question text",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": 0 // Index of the correct option
              }
            ]

            CONTENT:
            ${extractedText}
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            response_format: { type: "json_object" } // Ensure JSON output
        });

        const aiResponse = completion.choices[0].message.content;
        
        // Groq sometimes wraps JSON in a key like "quiz" or just returns the array.
        // We'll parse it and extract the array.
        let quizData = JSON.parse(aiResponse);
        if (quizData.quiz) quizData = quizData.quiz;
        if (!Array.isArray(quizData)) {
            // Handle cases where it's wrapped in another object
            const keys = Object.keys(quizData);
            if (keys.length > 0 && Array.isArray(quizData[keys[0]])) {
                quizData = quizData[keys[0]];
            }
        }

        res.json(quizData);

    } catch (err) {
        console.error("AI Quiz Generation Error:", err.message);
        res.status(500).json({ msg: 'AI Quiz Generation Failed', error: err.message });
    }
});

// --- AI SYLLABUS GENERATION ---
// Route: POST /api/courses/:id/generate-syllabus-preview
router.post('/:id/generate-syllabus-preview', async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            return res.status(400).json({ msg: 'GROQ_API_KEY missing in server .env' });
        }

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        const topic = req.body.topic || course.title;

        // Extract existing module titles to avoid duplication
        const existingModules = course.content.map(c => `- ${c.title}`).join('\n');
        const contextStr = existingModules.length > 0 
            ? `\nIMPORTANT: The course ALREADY HAS the following modules:\n${existingModules}\n\nDO NOT generate any modules that duplicate or overlap with the above list. Generate completely NEW, subsequent lessons that continue the curriculum.` 
            : '';

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const prompt = `
            You are an expert instructional designer and syllabus builder. 
            The instructor wants to create a comprehensive course syllabus for the topic: "${topic}".
            The course description is: "${course.description}".
            ${contextStr}
            
            Generate a structured curriculum consisting of exactly 6-10 new modules (lessons).
            Make sure to include a mix of BOTH "video" lessons and "pdf" (reading/study document) lessons.
            
            RULES for the "description" field:
            - If type is "video", write a detailed, engaging paragraph (3-4 sentences) explaining exactly what the student will learn. 
            - If type is "pdf", leave the description completely empty ("").

            Return ONLY a valid JSON object with a single key "modules" containing an array of objects:
            {
              "modules": [
                {
                  "title": "Module Title",
                  "description": "Detailed video description (or empty string if pdf)",
                  "type": "video" // or "pdf"
                }
              ]
            }
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const aiResponse = JSON.parse(completion.choices[0].message.content);
        let generatedModules = aiResponse.modules;

        if (!Array.isArray(generatedModules)) {
             return res.status(500).json({ msg: 'AI returned malformed syllabus structure.' });
        }

        // Just return the generated modules for preview
        const newContents = generatedModules.map(mod => ({
            _id: 'draft_' + Math.random().toString(36).substr(2, 9), // Temp ID for React keys
            title: mod.title,
            description: mod.description,
            type: mod.type === 'pdf' ? 'pdf' : 'video',
        }));

        res.json(newContents);

    } catch (err) {
        console.error("AI Syllabus Generation Error:", err.message);
        res.status(500).json({ msg: 'Server error generating syllabus', error: err.message });
    }
});

// Route: POST /api/courses/:id/save-syllabus
router.post('/:id/save-syllabus', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        const { modules } = req.body;
        if (!Array.isArray(modules)) {
             return res.status(400).json({ msg: 'Modules array required' });
        }

        // Add them to the course content
        const newContents = modules.map(mod => ({
            title: mod.title,
            description: mod.description,
            type: mod.type || 'video',
        }));

        course.content.push(...newContents);
        await course.save();

        res.json(course.content);

    } catch (err) {
        console.error("Save Syllabus Error:", err.message);
        res.status(500).json({ msg: 'Server error saving syllabus', error: err.message });
    }
});

// @route   POST /api/courses/:id/reviews
// @desc    Add review
// @access  Private
router.post('/:id/reviews', reviewUpload.array('images', 5), async (req, res) => {
  const { rating, comment, userId, userName } = req.body;

  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      const alreadyReviewed = course.reviews.find(
        (r) => r.user.toString() === userId.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ msg: 'Course already reviewed' });
      }

      const images = req.files ? req.files.map(file => file.path) : [];

      const review = {
        name: userName,
        rating: Number(rating),
        comment,
        user: userId,
        images,
      };

      course.reviews.push(review);

      course.numReviews = course.reviews.length;

      course.rating =
        course.reviews.reduce((acc, item) => item.rating + acc, 0) /
        course.reviews.length;

      await course.save();
      res.status(201).json({ msg: 'Review added' });
    } else {
      res.status(404).json({ msg: 'Course not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

