const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const cors = require('cors');
const Groq = require('groq-sdk');
const bodyParser = require('body-parser');
dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

app.get('/snippets', async (req, res) => {
  try {
    const snippets = await prisma.snippet.findMany();
    res.json(snippets);
  } catch (error) {
    console.error('Error fetching snippets:', error);
    res.status(500).json({ error: 'Failed to fetch snippets' });
  }
});



app.post('/snippets', async (req, res) => {
  try {
    const { title, code, language, createdBy } = req.body; // Include createdBy in the request body
    const snippet = await prisma.snippet.create({
      data: {
        title,
        code,
        language,
        createdBy,
      },
    });
    res.json(snippet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create snippet' });
  }
});

app.delete('/snippets/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const snippet = await prisma.snippet.delete({
      where: { id },
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    console.error('Error deleting snippet:', error);
    res.status(500).json({ error: 'Failed to delete snippet' });
  }
});

app.put('/snippets/:id', async (req, res) => {
  const { id } = req.params;
  const { title, code, language } = req.body;

  try {
    const updatedSnippet = await prisma.snippet.update({
      where: { id },
      data: {
        title,
        code,
        language,
      },
    });

    res.json(updatedSnippet);
  } catch (error) {
    console.error('Error updating the snippet:', error);
    res.status(500).json({ error: 'Failed to update snippet' });
  }
});



const groq = new Groq({ apiKey: process.env.API_KEY  });

app.use(bodyParser.json());


app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      "messages": [
        {
          "role": "user",
          "content": message
        }
      ],
      "model": "llama3-8b-8192",
      "temperature": 1,
      "max_tokens": 1024,
      "top_p": 1,
      "stream": false,
      "stop": null
    });

    res.json({ response: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error('Error creating chat completion:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});






app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
