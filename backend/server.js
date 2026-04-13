require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro", generationConfig: { responseMimeType: "application/json" } });

app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { syllabus, count_per_section = 5, difficulty = 'medium' } = req.body;
    
    // Default fallback if no syllabus is provided
    let syllabusDesc = syllabus && syllabus.trim().length > 0 
      ? syllabus 
      : "General aptitude concepts including synonyms, antonyms, basic grammar for English; number series, coding-decoding, syllogism for Logical; speed-distance-time, percentages, basic ratios for Quant.";

    const prompt = `You are the backend brain of an aptitude quiz application called GenQuiz.
Your job is to generate highly dynamic and tricky quiz questions for placement assessments covering three sections:
1. English Ability
2. Logical Reasoning  
3. Quantitative Aptitude

The questions MUST be specifically tailored around this provided syllabus or job description:
"${syllabusDesc}"

Difficulty level requested: ${difficulty}
Please generate EXACTLY ${count_per_section} questions for EACH section.

You MUST respond with ONLY a valid JSON object in EXACTLY this structure - no markdown, no backticks, no explanation:
{
  "english": [
    {
      "q": "Question text here?",
      "opts": ["Option A", "Option B", "Option C", "Option D"],
      "ans": 1,
      "exp": "Brief explanation of the correct answer.",
      "section": "english"
    }
  ],
  "logical": [...],
  "quant": [...]
}

Rules you must follow strictly:
- "ans" is the ZERO-BASED index of the correct answer in "opts"
- All 4 options must be plausible, only one correct
- "exp" must be concise (1-2 sentences max)
- Questions must match the requested difficulty: ${difficulty}
- Never repeat questions across calls
- Cover a variety of sub-topics within the requested syllabus per call
- JSON MUST BE STRICTLY FORMATTED without any markdown headers.`;

    // Attempt to generate the JSON
    const result = await model.generateContent(prompt);
    let outputText = result.response.text();
    
    // Minor cleanup just in case the model returns markdown codeblocks
    outputText = outputText.replace(/^```json/mi, '').replace(/```$/m, '').trim();

    const quizData = JSON.parse(outputText);
    
    res.json(quizData);
  } catch (error) {
    console.error("Error generating quiz via Gemini API:", error);
    res.status(500).json({ error: "Failed to parse or generate quiz from AI. Ensure API Key is correct." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`GenQuiz Backend with Gemini AI is running on port ${PORT}`);
});
