
import express from 'express';
import path from 'path';
import chatCompletionsApiRouter from './api/chat_completions.js';
import dotenv from 'dotenv';
import cors from 'cors';


//load .env file
dotenv.config({ path: '.env.server.local' });

const app = express();


//CORS

const APP_INGRESS_URL_1=process.env.APP_INGRESS_URL_1;
const APP_INGRESS_URL_2=process.env.APP_INGRESS_URL_2;

app.use(cors());

app.use(express.json());

const PORT = process.env.SERVER_PORT || 5500;

app.use('/api/chat/completions', chatCompletionsApiRouter);

// Endpoint to retrieve the X-MS-CLIENT-PRINCIPAL-NAME header value by the client app
app.get('/api/get-authenticated-principal-name', (req, res) => {
  const clientPrincipalName = req.headers['x-ms-client-principal-name'] || 'unknown user';
  res.json({ clientPrincipalName });
  console.log('GET /api/get-authenticated-principal-name: returning ' + clientPrincipalName);
});


// Serve static files from the React app
app.use(express.static(path.resolve('dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve('dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}; Access the app http://localhost:${PORT}/`);
});
