import express from 'express';
import axios from 'axios';
import { DefaultAzureCredential } from '@azure/identity';

import { default as LogAnalyticsClient } from '@azure/monitor-query';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const OPENAI_API_URL = process.env.OPENAI_API_URL;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    const AZURE_LOG_ANALYTICS_RESOURCE_URI = process.env.AZURE_LOG_ANALYTICS_RESOURCE_URI;

    const provider = req.headers['x-portkey-provider'];
    const authHeader = provider === 'openai'
      ? `Bearer ${OPENAI_API_KEY}`
      : `Bearer ${ANTHROPIC_API_KEY}`;

    if (AZURE_LOG_ANALYTICS_RESOURCE_URI) {
      const credential = new DefaultAzureCredential();
      const logAnalyticsClient = new LogAnalyticsClient(credential, AZURE_LOG_ANALYTICS_RESOURCE_URI);

      await logAnalyticsClient.send({
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          principal: req.headers['x-ms-principal'],
          contentLength: req.headers['content-length'],
          headers: JSON.stringify(req.headers),
        }),
        type: 'chatbot_api_requests',
      });
    }

    const response = await axios.post(OPENAI_API_URL, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      responseType: 'stream',
    });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    let responseSize = 0;
    let streamCompleted = false;

    response.data.on('data', (chunk) => {
      res.write(chunk);
      responseSize += chunk.length;
    });

    response.data.on('end', async () => {
      streamCompleted = true;
      res.write('data: [DONE]\n\n');
      res.end();

      if (AZURE_LOG_ANALYTICS_RESOURCE_URI) {
        await logAnalyticsClient.send({
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            principal: req.headers['x-ms-principal'],
            contentLength: req.headers['content-length'],
            headers: JSON.stringify(req.headers),
            responseCode: response.status,
            streamCompleted: 'Y',
            responseSize,
          }),
          type: 'chatbot_api_req_responses',
        });
      }
    });

    req.on('close', async () => {
      if (!streamCompleted) {
        if (AZURE_LOG_ANALYTICS_RESOURCE_URI) {
          await logAnalyticsClient.send({
            body: JSON.stringify({
              timestamp: new Date().toISOString(),
              principal: req.headers['x-ms-principal'],
              contentLength: req.headers['content-length'],
              headers: JSON.stringify(req.headers),
              responseCode: response.status,
              streamCompleted: 'N',
              responseSize,
            }),
            type: 'chatbot_api_req_responses',
          });
        }
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;


