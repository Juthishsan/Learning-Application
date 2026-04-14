const express = require('express');
const router = express.Router();
const { Groq } = require('groq-sdk');
const User = require('../models/User');
const Course = require('../models/Course');

router.post('/recommendations', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'GROQ_API_KEY missing in server env.' });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const user = await User.findById(userId);
        const allCourses = await Course.find({}, 'title description category _id');

        if (!user || allCourses.length === 0) {
            return res.json([]);
        }

        const userProfile = {
            bio: user.bio || 'Not provided',
            preferences: user.preferences || {},
            enrolledCount: user.enrolledCourses?.length || 0
        };

        const courseListForAI = allCourses.map(c => ({
            id: c._id,
            title: c.title,
            category: c.category,
            desc: c.description.substring(0, 100)
        }));

        const systemPrompt = `
            You are a helpful AI that recommends online courses. 
            Based on the user's profile, select exactly 4 courses from the provided list that would be most relevant to them.
            
            User Profile:
            Field: ${userProfile.preferences.field || 'General'}
            Occupation: ${userProfile.preferences.occupation || 'Student'}
            Skills: ${userProfile.preferences.skills?.join(', ') || 'Not specified'}
            Bio: ${userProfile.bio}

            CRITICAL: Return ONLY a raw JSON array of the 4 course IDs. Example: ["id1", "id2", "id3", "id4"]
            No other text.
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Courses: ${JSON.stringify(courseListForAI)}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
        });

        let recommendedIds = [];
        try {
            const content = chatCompletion.choices[0].message.content;
            // Clean the response in case AI adds markdown
            const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
            recommendedIds = JSON.parse(cleanedContent);
        } catch (e) {
            console.error("Failed to parse AI response:", e);
            // Fallback: just return the first 4 if AI fails
            recommendedIds = allCourses.slice(0, 4).map(c => c._id);
        }

        // Fetch full course details for the recommended IDs
        const recommendedCourses = await Course.find({ _id: { $in: recommendedIds } });
        
        // Ensure we maintain the AI's order if possible, or just return what we found
        res.json(recommendedCourses);

    } catch (error) {
        console.error("AI Recommendation Error:", error.message);
        res.status(500).json({ error: "Failed to generate recommendations." });
    }
});

router.post('/learning-insights', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'GROQ_API_KEY missing.' });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const user = await User.findById(userId).populate({
            path: 'enrolledCourses.courseId',
            select: 'title description instructor'
        });

        if (!user || !user.enrolledCourses || user.enrolledCourses.length === 0) {
            return res.status(404).json({ msg: 'No enrollment data for this user.' });
        }

        const statsForAI = user.enrolledCourses.map(e => ({
            course: e.courseId?.title || 'Unknown',
            progress: e.progress,
            quizzes: e.quizzes?.map(q => q.score) || [],
            assignments: e.assignments?.map(a => a.score) || [],
            enrolledAt: e.enrolledAt
        }));

        const systemPrompt = `
            You are a expert learning analytics AI for EroSkillUp E-Learning Academy.
            Analyze the following student performance data and provide actionable insights.
            
            Return ONLY a raw JSON object with this exact structure:
            {
                "overallAssessment": "string (summary sentence)",
                "learningPace": "string (Ahead / On-track / Behind)",
                "strengths": ["string", "string"],
                "weakAreas": ["string", "string"],
                "studyTips": ["string", "string"],
                "predictedCompletion": "string (e.g. By end of next week)"
            }
            
            No other text. Be formal yet encouraging.
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Student Data: ${JSON.stringify(statsForAI)}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
        });

        try {
            const content = chatCompletion.choices[0].message.content;
            const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const insights = JSON.parse(cleanedContent);
            res.json(insights);
        } catch (e) {
            console.error("Insights AI Parse Error:", e.message);
            res.status(500).json({ error: "AI response was not valid JSON." });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/instructor-insights', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'GROQ_API_KEY missing.' });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const instructor = await User.findById(userId);
        if (!instructor) return res.status(404).json({ msg: 'Instructor not found.' });

        const myCourses = await Course.find({ instructor: instructor.name });
        const users = await User.find({ 'enrolledCourses.courseId': { $in: myCourses.map(c => c._id) } });

        // Aggregate Performance Data for AI
        const courseData = myCourses.map(course => {
            const enrollmentsForCourse = users.flatMap(u => 
                u.enrolledCourses.filter(e => e.courseId.toString() === course._id.toString())
            );

            const avgProgress = enrollmentsForCourse.length > 0
                ? enrollmentsForCourse.reduce((acc, e) => acc + e.progress, 0) / enrollmentsForCourse.length
                : 0;

            const allQuizScores = enrollmentsForCourse.flatMap(e => e.quizzes?.map(q => q.score) || []);
            const avgQuizScore = allQuizScores.length > 0
                ? allQuizScores.reduce((a, b) => a + b, 0) / allQuizScores.length
                : 0;

            return {
                title: course.title,
                studentCount: enrollmentsForCourse.length,
                avgProgress: avgProgress.toFixed(1) + '%',
                avgQuizScore: avgQuizScore.toFixed(1) + '%',
                rating: course.rating || 0
            };
        });

        const systemPrompt = `
            You are a expert Course Strategist & Educational Data Scientist.
            Analyze the following instructor course data and provide strategic insights for EroSkillUp Academy.
            
            Return ONLY a raw JSON object with this exact structure:
            {
                "engagementOverview": "string (general trend summary)",
                "contentAnalysis": {
                    "highEngagement": ["string", "string"],
                    "lowEngagement": ["string", "string"]
                },
                "assessmentHealth": {
                    "difficultyRating": "string (Easy / Balanced / Challenging)",
                    "observation": "string (sentence about quiz performance)"
                },
                "strategicAdvice": ["string", "string", "string"],
                "nextSteps": "string (immediate priority)"
            }
            
            No other text. Be analytical and professional.
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Instructor Course Metrics: ${JSON.stringify(courseData)}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
        });

        try {
            const content = chatCompletion.choices[0].message.content;
            const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const insights = JSON.parse(cleanedContent);
            res.json(insights);
        } catch (e) {
            console.error("Instructor AI Parse Error:", e.message);
            res.status(500).json({ error: "AI response was not valid JSON." });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;


