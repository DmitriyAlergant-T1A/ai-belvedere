//get-authenticated-principal-name.js

import express from 'express';

export const getAuthenticatedPrincipalNameRouter = () => {
  const router = express.Router();

  router.get('/', async (req, res) => {
      const clientPrincipalName = req.headers['x-ms-client-principal-name'] || 'unknown user';
      res.json({ clientPrincipalName });
      console.log('GET /api/get-authenticated-principal-name: returning ' + clientPrincipalName);
  });

  return router;
};
