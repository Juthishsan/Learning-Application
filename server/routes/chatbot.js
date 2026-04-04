const express = require('express');
const router = express.Router();
const { Groq } = require('groq-sdk');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const Course = require('../models/Course'); // for retrieving course info

router.post('/', async (req, res) => {
    try {
        const { message, history, courseId } = req.body;

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'GROQ_API_KEY missing in server env.' });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        let courseContext = '';
        if (courseId) {
            try {
                // Ignore invalid mongoose IDs
                if (courseId.match(/^[0-9a-fA-F]{24}$/)) {
                    const course = await Course.findById(courseId);
                    if (course) {
                        courseContext += `\nCONVERSATION CONTEXT: The user is currently viewing the course "${course.title}". `;
                        courseContext += `\nCourse Description: ${course.description}\n`;
                        
                        // Add transcripts and PDF documents if available
                        let materialsText = '';
                        
                        // We will process all content items to gather knowledge
                        for (const item of course.content || []) {
                            // 1. Process Video Transcripts
                            if (item.transcript && item.transcript.length > 0) {
                                materialsText += `\n--- Video Lesson: ${item.title} ---\nTranscript:\n`;
                                item.transcript.forEach(t => {
                                    materialsText += `${t.text} `;
                                });
                                materialsText += '\n';
                            }
                            
                            // 2. Process attached PDF Documents
                            if (item.type === 'pdf' && item.url) {
                                try {
                                    materialsText += `\n--- Document/PDF Lesson: ${item.title || item.fileName} ---\n`;
                                    const pdfResponse = await axios.get(item.url, { responseType: 'arraybuffer' });
                                    const pdfBuffer = Buffer.from(pdfResponse.data);
                                    const pdfData = await pdfParse(pdfBuffer);
                                    const extractedText = pdfData.text.replace(/\s+/g, ' ').trim(); // Clean up whitespace
                                    
                                    // Append it
                                    materialsText += `${extractedText}\n`;
                                } catch (pdfError) {
                                    console.error(`Failed to parse PDF ${item.title}:`, pdfError.message);
                                }
                            }
                        }
                        
                        // Limit combined materials text length to prevent blowing up the context window.
                        // Up to ~18,000 characters to stay safe within model token limits.
                        if (materialsText) {
                            courseContext += `\nKEY COURSE CONTENTS & MATERIALS (Transcripts and PDFs):\n${materialsText.substring(0, 18000)}\n`;
                        }
                    }
                }
            } catch (e) {
                console.error('Context fetch error:', e);
            }
        }

        // Build the system prompt enforcing restrictions
        const systemPrompt = `
You are an expert AI Tutor and Support Agent for "EroSkillUp" (or "Learning-Application" / "E-Platform").
Your role is to strictly assist students with:
1. Questions related to their courses.
2. Information about the institution and platform features.
3. Explaining concepts found in course materials.

CRITICAL RULES:
- You MUST NOT answer any questions that are completely unrelated to courses, coding, education, or the platform itself.
- If a user asks about general knowledge not related to the platform/courses (like weather, general politics, etc.), politely decline and remind them you are an educational tutor for this platform.
- Be concise, supportive, and kind.
- Format your responses using markdown when applicable (bolding, lists, code blocks).
${courseContext}
        `;

        // Format history for Groq
        const formattedHistory = history.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));

        const messages = [
            { role: "system", content: systemPrompt },
            ...formattedHistory,
            { role: "user", content: message }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
        });

        const aiResponse = chatCompletion.choices[0].message.content;

        res.json({ text: aiResponse, sender: 'bot' });

    } catch (error) {
        console.error("Chatbot Error:", error.message);
        res.status(500).json({ error: "Failed to generate AI response." });
    }
});

module.exports = router;
