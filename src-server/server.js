import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import https from 'https';
import http from 'http';

import chatCompletionsApiRouter from './api/chatCompletions.js';
import { configApiRouter } from './api/configApiRouter.js';

import pkg from 'express-openid-connect';
const { auth, requiresAuth } = pkg;

//load .env file
dotenv.config({ path: '.env.server.local' });

const app = express();

//Enable unrestricted CORS (for now it's ok)
app.use(cors());

app.use(express.json());

const authConfig = {
  authRequired: true,
  //auth0Logout: true,
  secret: process.env.AUTH_SECRET,
  baseURL: process.env.OIDC_BASEURL,
  clientID: process.env.OIDC_CLIENTID,  
  issuerBaseURL: process.env.OIDC_ISSUERBASEURL
};

// Middleware to conditionally apply authentication
const conditionalAuth = (req, res, next) => {
  if (process.env.AUTH_AUTH0 === 'Y') {
    requiresAuth()(req, res, next);
  } else {
    next();
  }
};


// Serve static web app content without authentication
app.use(express.static(path.resolve('dist')));

// Main app route (react app) without authentication
app.get('/', (req, res) => {
  res.sendFile(path.resolve('dist', 'index.html'));
});

// auth router attaches /login, /logout, and /callback routes to the baseURL
if (process.env.AUTH_AUTH0 === 'Y') {
  app.use(auth(authConfig));
}

// Main endpoint for chat completions
app.use('/api/chat/completions', conditionalAuth, chatCompletionsApiRouter);

// Endpoint to retrieve server-side configuration items
app.use('/api/config', conditionalAuth, configApiRouter());

app.get('/api/profile', conditionalAuth, (req, res) => {
  if (process.env.AUTH_AUTH0 === 'Y') {
    res.send(JSON.stringify(req.oidc.user));
  } else if (process.env.AUTH_AAD_EXTERNAL === 'Y') {
    res.send(JSON.stringify({"username":req.headers['x-ms-client-principal-name'] || "unknown user"}));
  } else {
    res.send(JSON.stringify({ message: 'Authentication disabled' }));
  }
});

// Main app route (react app) with authentication for other routes
app.get('/*', (req, res) => {
  res.sendFile(path.resolve('dist', 'index.html'));
});

const PORT = process.env.SERVER_PORT || 5500;

// Check if HTTPS is enabled via environment variable
if (process.env.USE_HTTPS === 'Y') {
  const httpsOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
  };
  
  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`HTTPS Server is running on port ${PORT}; Access the app https://localhost:${PORT}/`);
  });
} else {
  http.createServer(app).listen(PORT, () => {
    console.log(`HTTP Server is running on port ${PORT}; Access the app http://localhost:${PORT}/`);
  });

// Redirect from HTTP to HTTPS
if (process.env.USE_HTTPS === 'Y') {
  const httpApp = express();
  httpApp.get('*', (req, res) => {
    res.redirect(`https://${req.headers.host}${req.url}`);
  });
  http.createServer(httpApp).listen(80, () => {
    console.log('HTTP Server running on port 80 for HTTPS redirection');
  });
}

}