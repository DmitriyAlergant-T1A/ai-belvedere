
import express from 'express';
import path from 'path';
import chatCompletionsApiRouter from './api/chat_completions.js';
import dotenv from 'dotenv';


//load .env file
dotenv.config({ path: '.env.server.local' });

const app = express();

//app.use(cors());

app.use(express.json());

const PORT = process.env.SERVER_PORT || 5500;

app.use('/api/chat/completions', chatCompletionsApiRouter);

// Serve static files from the React app
app.use(express.static(path.resolve('dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve('dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}; Access the app http://localhost:${PORT}/`);
});
