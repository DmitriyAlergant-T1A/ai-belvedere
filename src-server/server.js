const express = require('express');
// const cors = require('cors');
const path = require('path');
const chatCompletionsApiRouter = require('./api/chat_completions');


//load .env file
require('dotenv').config();

const app = express();
//app.use(cors());
app.use(express.json());

const PORT = process.env.SERVER_PORT || 5500;

app.use('/api/v1/chat/completions', chatCompletionsApiRouter);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}; Access the app http://localhost:${PORT}/`);
});
