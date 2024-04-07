
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';

import chatCompletionsApiRouter from './api/chatCompletions.js';
import { configApiRouter } from './api/configApiRouter.js';
import { getAuthenticatedPrincipalNameRouter } from './api/getAuthenticatedPrincipalName.js';


//load .env file
dotenv.config({ path: '.env.server.local' });

const app = express();


//Enable unrestricted CORS (for now it's ok)
app.use(cors());

app.use(express.json());

const PORT = process.env.SERVER_PORT || 5500;

// Main endpoint for chat completions
app.use('/api/chat/completions', chatCompletionsApiRouter);

// Endpoint to retrieve server-side configuration items
app.use('/api/config', configApiRouter());

// Endpoint to retrieve the X-MS-CLIENT-PRINCIPAL-NAME header value by the client app
app.use('/api/get-authenticated-principal-name', getAuthenticatedPrincipalNameRouter());

// Serve static files from the React app
app.use(express.static(path.resolve('dist')));
``
// Handle React routing, return all requests to React app
app.get('/', (req, res) => {
  res.sendFile(path.resolve('dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}; Access the app http://localhost:${PORT}/`);
});
