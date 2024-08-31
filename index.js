const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const markdown = require('markdown').markdown;
const bodyParser = require('body-parser');
const logging = require('morgan');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(logging('dev'));

// Mock function to simulate Groq-like behavior using HTTP API
async function callGroqAPI(data) {
  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', data, {
      headers: { 
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Error calling Groq API: ' + error.message);
  }
}

// Error handler middleware
app.use((err, req, res, next) => {
  if (err) {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  res.send('Hello World! You are my world Riya......shona meraa...bacha...main tumse bada pyar karta meri shona..umwahhh');
  console.log("Running");
});

// Route to generate code
app.post('/generate-code', async (req, res) => {
  const description = req.body.query;
  if (!description) {
    return res.status(400).json({ error: 'No description provided. Please provide a description to generate code.' });
  }

  try {
    const chatResponse = await callGroqAPI({
      messages: [{
        role: 'user',
        content: `Generate code for the following description: ${description}.`
      }],
      model: 'llama3-8b-8192'
    });
    const generatedCode = chatResponse.choices[0].message.content;
    res.json({ code: generatedCode });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Route to explain code
app.post('/explain-code', async (req, res) => {
  const codeSnippet = req.body.code;
  if (!codeSnippet) {
    return res.status(400).json({ error: 'No code provided. Please provide code to explain.' });
  }

  try {
    const chatResponse = await callGroqAPI({
      messages: [{
        role: 'user',
        content: `Explain the following code: ${codeSnippet}`
      }],
      model: 'llama3-8b-8192'
    });
    const explanation = chatResponse.choices[0].message.content;
    const markdownExplanation = markdown.toHTML(explanation);
    res.json({ explanation: markdownExplanation });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Route to debug code
app.post('/debug-code', async (req, res) => {
  const codeSnippet = req.body.code;
  if (!codeSnippet) {
    return res.status(400).json({ error: 'No code provided. Please provide code to debug.' });
  }

  try {
    const result = await callGroqAPI({
      messages: [{
        role: 'user',
        content: `Solve the errors in the following code and return the updated code with comments showing the changes made:\n\n${codeSnippet}`
      }],
      model: 'gemini-pro'
    });
    const debuggedCode = result.choices[0].message.content;
    res.json({ code: debuggedCode });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Route to run code
app.post('/run-code', async (req, res) => {
  const codeSnippet = req.body.code;
  if (!codeSnippet) {
    return res.status(400).json({ error: 'No code provided. Please provide code to run.' });
  }

  try {
    const chatResponse = await callGroqAPI({
      messages: [{
        role: 'user',
        content: `Compile this code and return the output or any errors as a terminal would:\n\n${codeSnippet}`
      }],
      model: 'llama3-8b-8192'
    });
    const output = chatResponse.choices[0].message.content;
    res.json({ output });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Test route
app.get('/test', (req, res) => {
  res.json({ output: 'The route is working' });
});

// Start the Express app
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
