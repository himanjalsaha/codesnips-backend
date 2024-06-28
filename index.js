const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());

app.get('/snippets', async (req, res) => {
  try {
    const snippets = await prisma.snippet.findMany({
      include: { user: true }, // Include user data in the response
    });
    res.json(snippets);
  } catch (error) {
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

// DELETE endpoint to delete a snippet by ID
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

  // PUT endpoint to update a snippet by ID
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
      console.error('Error updating snippet:', error);
      res.status(500).json({ error: 'Failed to update snippet' });
    }
  });
  
  

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
