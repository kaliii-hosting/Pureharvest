import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

app.use(express.json());
app.use(express.static(__dirname));

// Initialize messages file if it doesn't exist
async function initMessagesFile() {
  try {
    await fs.access(MESSAGES_FILE);
  } catch {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify([]));
  }
}

// Get all messages
app.get('/api/messages', async (req, res) => {
  try {
    const data = await fs.readFile(MESSAGES_FILE, 'utf-8');
    const messages = JSON.parse(data);
    res.json(messages.reverse()); // Show newest first
  } catch (error) {
    console.error('Error reading messages:', error);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// Submit a new message
app.post('/api/messages', async (req, res) => {
  try {
    const { name, email, message, timestamp } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const data = await fs.readFile(MESSAGES_FILE, 'utf-8');
    const messages = JSON.parse(data);

    messages.push({
      id: Date.now(),
      name,
      email,
      message,
      timestamp: timestamp || new Date().toISOString()
    });

    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));

    res.json({ success: true, message: 'Message saved successfully' });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Delete a message
app.delete('/api/messages/:id', async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);

    const data = await fs.readFile(MESSAGES_FILE, 'utf-8');
    const messages = JSON.parse(data);

    const filteredMessages = messages.filter(msg => msg.id !== messageId);

    if (filteredMessages.length === messages.length) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await fs.writeFile(MESSAGES_FILE, JSON.stringify(filteredMessages, null, 2));

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Start server
initMessagesFile().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin page: http://localhost:${PORT}/admin.html`);
  });
});
