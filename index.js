const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { userRouter } = require('./routers/user');
const { auth } = require('./auth'); // Import the auth middleware
require('dotenv').config();

// --- Gemini Integration ---
const { GoogleGenerativeAI } = require('@google/generative-ai');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY not found in .env file");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// -------------------------

const app = express();

// --- Middleware (Consolidated at the top) ---
// These MUST come before your routes are defined.
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
// ------------------------------------------------

// --- API Routes ---
app.use('/api/v1/user', userRouter); // For login/signup

// --- Protected Routes (Require Authentication) ---
app.get('/chatpage', auth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chatpage.html'));
});

// This is the single, protected endpoint for Gemini
app.post('/ask-gemini', auth, async (req, res) => {
  if (!req.body || !req.body.prompt) {
    return res.status(400).json({ error: "Request must include a 'prompt'" });
  }

  const userPrompt = req.body.prompt;

  const prompt = `
    Analyze the sentiment of the following user text. Classify it into one of these six emotions: sadness, joy, love, anger, fear, or surprise.
    Based on the detected emotion, provide one single suggestion. The suggestion must be from one of three categories: "quote", "song", or "activity".
    Your response MUST be in a valid JSON format, like this:
    {
      "sentiment": "detected_emotion",
      "suggestion": "your_suggestion_text_here"
    }
    User Text: "${userPrompt}"
    JSON Response:
  `;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    
    // Clean and parse the response from Gemini
    const cleanedText = response.text().trim().replace(/```json/g, "").replace(/```/g, "");
    const jsonResponse = JSON.parse(cleanedText);

    // Send the structured JSON object back to the frontend
    res.json({ response: jsonResponse });

  } catch (error) {
    console.error("Error processing Gemini response:", error);
    res.status(500).json({ error: "Failed to process the model's response." });
  }
});

// --- Server Startup ---
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

module.exports = app;
